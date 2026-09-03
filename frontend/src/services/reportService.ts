import { Report, ReportFilter, ReportDateFilter, ReportSummaryStats } from '../types/report';
import { apiClient } from './apiClient';

export const reportService = {
  async getReports(
    userId: string = 'usr_guest',
    typeFilter: ReportFilter = 'all',
    dateFilter: ReportDateFilter = 'all',
    searchQuery: string = ''
  ): Promise<Report[]> {
    try {
      const response = await apiClient.get(`/reports/${userId}`);
      let list: Report[] = [];
      if (response.success && response.reports) {
        list = response.reports;
      }

      // Basic client-side filtering if backend doesn't support query params yet
      if (typeFilter !== 'all') {
        list = list.filter((r) => r.type === typeFilter);
      }

      if (dateFilter !== 'all') {
        const now = Date.now();
        list = list.filter((r) => {
          const reportTime = new Date(r.date).getTime();
          const diffDays = (now - reportTime) / (1000 * 60 * 60 * 24);
          if (dateFilter === 'today') return diffDays <= 1;
          if (dateFilter === 'last_7_days') return diffDays <= 7;
          if (dateFilter === 'last_30_days') return diffDays <= 30;
          if (dateFilter === 'last_6_months') return diffDays <= 180;
          return true;
        });
      }

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q) ||
            (r.summary && r.summary.toLowerCase().includes(q))
        );
      }

      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.error("Failed to fetch reports", e);
      return [];
    }
  },

  async getReportById(id: string): Promise<Report | null> {
    try {
      const response = await apiClient.get(`/reports/detail/${id}`);
      if (response.success && response.report) {
        return response.report;
      }
      return null;
    } catch (e) {
      console.error('Failed to fetch report by ID', e);
      return null;
    }
  },

  async createReport(userId: string, reportData: any, analysisId?: string): Promise<string> {
    const response = await apiClient.post('/reports', {
      user_id: userId,
      report_data: reportData,
      analysis_id: analysisId
    });
    if (response.success && response.report_id) {
      return response.report_id;
    }
    throw new Error('Failed to create report');
  },

  async getSummaryStats(userId: string = 'usr_guest'): Promise<ReportSummaryStats> {
    const all = await this.getReports(userId, 'all', 'all');
    return {
      totalReports: all.length,
      skincareReports: all.filter((r) => r.type === 'skincare').length,
      diseaseReports: all.filter((r) => r.type === 'disease').length,
      progressReports: all.filter((r) => r.type === 'progress').length,
    };
  },

  async deleteReport(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`/reports/${id}`);
      return response.success;
    } catch (e) {
      console.error('Failed to delete report', e);
      return false;
    }
  },

  async generateShareLink(id: string): Promise<string> {
    const token = `share_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return `${window.location.origin}/dashboard/reports/${id}?token=${token}`;
  },
};
