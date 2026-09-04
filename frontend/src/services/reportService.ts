/**
 * reportService.ts
 *
 * Reads analysis records from the Supabase `analyses` table directly using the
 * authenticated Supabase JS client (anon key + user JWT session).
 *
 * ROOT-CAUSE FIX: The backend FastAPI saves all skincare + disease analyses to
 * the `analyses` table (via save_skincare_analysis / save_analysis_result).
 * The old service called GET /reports/{user_id} which queried the `reports` table
 * -- a table that was NEVER populated by any analysis flow, so counts were always 0.
 *
 * The `analyses` table has correct RLS already applied:
 *   SELECT  USING  (auth.uid() = user_id)    <- frontend reads with anon key + session
 *   INSERT  WITH CHECK (auth.uid() = user_id) <- backend inserts with service-role key
 *
 * No backend round-trip is needed for listing reports.
 */
import { supabase } from './supabaseClient';
import { Report, ReportFilter, ReportDateFilter, ReportSummaryStats } from '../types/report';
import { apiClient } from './apiClient';

// ---------------------------------------------------------------------------
// Internal: map an `analyses` table row → frontend Report interface
// ---------------------------------------------------------------------------
function mapAnalysisToReport(row: Record<string, any>): Report {
  const type: Report['type'] =
    row.analysis_type === 'disease' ? 'disease'
    : row.analysis_type === 'skincare' ? 'skincare'
    : 'skincare';

  const recs: Record<string, any> = row.recommendations ?? {};

  let title = 'Analysis Report';
  let summary = '';

  if (type === 'skincare') {
    title = 'Skincare Analysis';
    summary = 'Skincare analysis completed. Detected skin type: ' + (row.condition ?? 'Combination') + '.';
  } else if (type === 'disease') {
    title = 'Skin Disease Screening';
    const cond = row.condition ?? 'Unknown';
    const confRaw = row.confidence;
    const conf = confRaw ? Math.round(Number(confRaw) * 100) + '% confidence' : '';
    const risk = row.risk_level ? ' (' + row.risk_level + ' risk)' : '';
    summary = 'AI Screening: ' + cond + (conf ? ' — ' + conf : '') + risk + '.';
  }

  return {
    id: row.id,
    userId: row.user_id,
    title,
    type,
    date: row.created_at,
    status: 'ready',
    summary,
    analysisId: row.id,
    skinType: type === 'skincare' ? (row.condition ?? undefined) : undefined,
    observations: Array.isArray(recs.observations) ? recs.observations : undefined,
    morningRoutine: Array.isArray(recs.morningRoutine) ? recs.morningRoutine : undefined,
    eveningRoutine: Array.isArray(recs.eveningRoutine) ? recs.eveningRoutine : undefined,
    productCategories: Array.isArray(recs.productCategories) ? recs.productCategories : undefined,
    lifestyleGuidance: Array.isArray(recs.lifestyleGuidance) ? recs.lifestyleGuidance
      : Array.isArray(recs.lifestyle_guidance) ? recs.lifestyle_guidance : undefined,
    nutritionGuidance: Array.isArray(recs.nutritionGuidance) ? recs.nutritionGuidance
      : Array.isArray(recs.nutrition_guidance) ? recs.nutrition_guidance : undefined,
    prediction: type === 'disease' ? (row.condition ?? undefined) : undefined,
    confidence: row.confidence ? Number(row.confidence) : undefined,
    riskLevel: row.risk_level ?? undefined,
    modelVersion: row.model_version ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Date-range filter helper
// ---------------------------------------------------------------------------
function withinDateRange(isoDate: string, dateFilter: ReportDateFilter): boolean {
  if (dateFilter === 'all') return true;
  const now = Date.now();
  const reportTime = new Date(isoDate).getTime();
  const diffDays = (now - reportTime) / (1000 * 60 * 60 * 24);
  if (dateFilter === 'today') return diffDays <= 1;
  if (dateFilter === 'last_7_days') return diffDays <= 7;
  if (dateFilter === 'last_30_days') return diffDays <= 30;
  if (dateFilter === 'last_6_months') return diffDays <= 180;
  return true;
}

export const reportService = {
  /**
   * Fetch all analyses for the authenticated user from the `analyses` table via
   * Supabase JS client. RLS automatically scopes results to auth.uid().
   * _userId param is kept for backwards-compat but ignored — the session is used.
   */
  async getReports(
    _userId: string = '',
    typeFilter: ReportFilter = 'all',
    dateFilter: ReportDateFilter = 'all',
    searchQuery: string = ''
  ): Promise<Report[]> {
    try {
      // RLS restricts rows to the currently authenticated user automatically
      let query = supabase
        .from('analyses')
        .select('id, user_id, analysis_type, condition, confidence, risk_level, model_version, recommendations, created_at')
        .order('created_at', { ascending: false });

      // Push type filter to DB when possible to reduce payload
      if (typeFilter === 'skincare') {
        query = query.eq('analysis_type', 'skincare');
      } else if (typeFilter === 'disease') {
        query = query.eq('analysis_type', 'disease');
      }
      // 'progress' type → no rows yet; returns [] correctly

      const { data, error } = await query;

      if (error) {
        console.error('[DermaSense] Supabase analyses query error:', error);
        throw new Error(error.message);
      }

      if (!data || data.length === 0) return [];

      let list: Report[] = (data as Record<string, any>[]).map(mapAnalysisToReport);

      // Client-side date filter
      if (dateFilter !== 'all') {
        list = list.filter((r) => withinDateRange(r.date, dateFilter));
      }

      // Client-side search filter
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q) ||
            (r.summary && r.summary.toLowerCase().includes(q)) ||
            (r.prediction && r.prediction.toLowerCase().includes(q)) ||
            (r.skinType && r.skinType.toLowerCase().includes(q))
        );
      }

      return list;
    } catch (e) {
      console.error('[DermaSense] Failed to fetch reports from analyses table:', e);
      throw e; // re-throw → ReportsPage shows error state instead of silent "0"
    }
  },

  /**
   * Fetch a single report by ID. Falls back to direct `analyses` lookup if
   * the backend detail endpoint returns nothing (e.g. record is in analyses, not reports).
   */
  async getReportById(id: string): Promise<Report | null> {
    // Try backend detail endpoint first
    try {
      const response = await apiClient.get('/reports/detail/' + id);
      if (response.success && response.report) {
        return response.report as Report;
      }
    } catch {
      // ignore — fall through
    }

    // Direct Supabase lookup in analyses table (RLS ensures ownership)
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;
      return mapAnalysisToReport(data as Record<string, any>);
    } catch (e) {
      console.error('[DermaSense] Failed to fetch report by ID:', e);
      return null;
    }
  },

  /** Create a report record via backend (forward-compat only — analyses is the source of truth). */
  async createReport(userId: string, reportData: any, analysisId?: string): Promise<string> {
    const response = await apiClient.post('/reports', {
      user_id: userId,
      report_data: reportData,
      analysis_id: analysisId,
    });
    if (response.success && response.report_id) {
      return response.report_id;
    }
    throw new Error('Failed to create report');
  },

  /** Compute summary statistics directly from the `analyses` table. */
  async getSummaryStats(_userId: string = ''): Promise<ReportSummaryStats> {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('analysis_type');

      if (error) {
        console.error('[DermaSense] Failed to fetch stats:', error);
        throw new Error(error.message);
      }

      if (!data) {
        return { totalReports: 0, skincareReports: 0, diseaseReports: 0, progressReports: 0 };
      }

      return {
        totalReports: data.length,
        skincareReports: data.filter((r) => r.analysis_type === 'skincare').length,
        diseaseReports: data.filter((r) => r.analysis_type === 'disease').length,
        progressReports: data.filter((r) => r.analysis_type === 'progress').length,
      };
    } catch (e) {
      console.error('[DermaSense] getSummaryStats failed:', e);
      throw e;
    }
  },

  /** Delete a report — tries backend first, then direct Supabase delete from analyses. */
  async deleteReport(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete('/reports/' + id);
      if (response.success) return true;
    } catch {
      // ignore
    }
    // Fallback: direct delete from analyses (RLS enforces ownership)
    try {
      const { error } = await supabase.from('analyses').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('[DermaSense] Failed to delete report:', e);
      return false;
    }
  },

  async generateShareLink(id: string): Promise<string> {
    const token = 'share_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    return window.location.origin + '/dashboard/reports/' + id + '?token=' + token;
  },
};
