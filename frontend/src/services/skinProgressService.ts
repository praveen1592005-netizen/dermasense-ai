import { ProgressPhoto, RoutineChangeLog, ProgressComparison } from '../types/progress';

const PROGRESS_PHOTOS_KEY = 'dermasense_progress_photos_v4';
const ROUTINE_CHANGES_KEY = 'dermasense_routine_change_logs_v4';

export const skinProgressService = {
  // --- PROGRESS PHOTOS ---
  async getProgressPhotos(userId: string): Promise<ProgressPhoto[]> {
    try {
      const raw = localStorage.getItem(PROGRESS_PHOTOS_KEY);
      if (!raw) {
        // Initial baseline demo progress photos
        const initial: ProgressPhoto[] = [
          {
            id: 'prog_01',
            userId,
            imagePreview:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Baseline skin capture prior to ceramide barrier routine.',
            skinType: 'Combination',
            observations: ['Mild redness on cheeks', 'T-zone shine', 'Surface dehydration'],
          },
          {
            id: 'prog_02',
            userId,
            imagePreview:
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
            date: new Date().toISOString(),
            notes: 'Week 4 check-in following consistent daily SPF 50 & hydrating cleanser.',
            skinType: 'Combination',
            observations: ['Improved barrier hydration', 'Calmer cheek appearance', 'Balanced oiliness'],
          },
        ];
        localStorage.setItem(PROGRESS_PHOTOS_KEY, JSON.stringify(initial));
        return initial;
      }
      const list: ProgressPhoto[] = JSON.parse(raw);
      return list.filter((item) => item.userId === userId || !item.userId);
    } catch {
      return [];
    }
  },

  async addProgressPhoto(photo: Omit<ProgressPhoto, 'id'>): Promise<ProgressPhoto> {
    const raw = localStorage.getItem(PROGRESS_PHOTOS_KEY);
    const list: ProgressPhoto[] = raw ? JSON.parse(raw) : [];
    const newPhoto: ProgressPhoto = {
      ...photo,
      id: `prog_${Date.now()}`,
    };
    list.unshift(newPhoto);
    localStorage.setItem(PROGRESS_PHOTOS_KEY, JSON.stringify(list));
    return newPhoto;
  },

  async deleteProgressPhoto(id: string): Promise<boolean> {
    try {
      const raw = localStorage.getItem(PROGRESS_PHOTOS_KEY);
      if (!raw) return true;
      const list: ProgressPhoto[] = JSON.parse(raw);
      const filtered = list.filter((item) => item.id !== id);
      localStorage.setItem(PROGRESS_PHOTOS_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  // --- ROUTINE CHANGES LOG ---
  async getRoutineChangeLogs(userId: string): Promise<RoutineChangeLog[]> {
    try {
      const raw = localStorage.getItem(ROUTINE_CHANGES_KEY);
      if (!raw) {
        const initial: RoutineChangeLog[] = [
          {
            id: 'log_01',
            userId,
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            action: 'routine_started',
            productName: 'Gentle Ceramide Cleanser & Barrier Lotion',
            category: 'Cleanser & Moisturizer',
            reason: 'Initiated structured AM/PM skincare protocol',
          },
          {
            id: 'log_02',
            userId,
            date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            action: 'added',
            productName: '1% Hyaluronic Sunscreen Aqua Gel SPF 50',
            category: 'Sunscreen',
            reason: 'Added daily broad-spectrum UV protection',
          },
          {
            id: 'log_03',
            userId,
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            action: 'added',
            productName: 'Niacinamide 10% + Zinc 1% Serum',
            category: 'Serum',
            reason: 'Targeting dark spot fading and sebum balance',
          },
        ];
        localStorage.setItem(ROUTINE_CHANGES_KEY, JSON.stringify(initial));
        return initial;
      }
      const list: RoutineChangeLog[] = JSON.parse(raw);
      return list.filter((item) => item.userId === userId || !item.userId);
    } catch {
      return [];
    }
  },

  async addRoutineChangeLog(log: Omit<RoutineChangeLog, 'id'>): Promise<RoutineChangeLog> {
    const raw = localStorage.getItem(ROUTINE_CHANGES_KEY);
    const list: RoutineChangeLog[] = raw ? JSON.parse(raw) : [];
    const newLog: RoutineChangeLog = {
      ...log,
      id: `log_${Date.now()}`,
    };
    list.unshift(newLog);
    localStorage.setItem(ROUTINE_CHANGES_KEY, JSON.stringify(list));
    return newLog;
  },

  // --- BEFORE / AFTER COMPARISON GENERATOR ---
  generateComparison(photos: ProgressPhoto[]): ProgressComparison | null {
    if (photos.length === 0) return null;

    if (photos.length === 1) {
      return {
        currentPhoto: photos[0],
        observedChanges: [
          'Initial baseline photo recorded.',
          'Consistent routine tracking is in progress.',
        ],
        areasToMonitor: [
          'Hydration retention over 2–4 weeks',
          'Sun protection consistency',
        ],
        recommendations: [
          'Continue current morning and evening skincare protocols.',
          'Capture a follow-up progress photo in 2 weeks under identical lighting.',
        ],
      };
    }

    // Compare earliest (baseline) vs latest
    const sorted = [...photos].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const previous = sorted[0];
    const current = sorted[sorted.length - 1];

    return {
      previousPhoto: previous,
      currentPhoto: current,
      previousAnalysisDate: previous.date,
      currentAnalysisDate: current.date,
      observedChanges: [
        'Visible enhancement in overall surface hydration and skin barrier balance.',
        'Calmer appearance with reduced surface redness observed during tracking window.',
        'Note: Multiple lifestyle, seasonal, and routine factors contribute to skin appearance over time.',
      ],
      areasToMonitor: [
        'Continue monitoring daytime UV protection and reapplication frequency.',
        'Maintain gentle cleansing to prevent transepidermal water loss.',
      ],
      recommendations: [
        'Maintain your current AM/PM routine protocol.',
        'Avoid introducing multiple new active ingredients simultaneously.',
        'Consult a dermatologist if any unusual or persistent skin symptoms arise.',
      ],
    };
  },
};
