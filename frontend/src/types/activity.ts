export type ActivityType = 
  | 'profile_updated'
  | 'skincare_analysis'
  | 'disease_analysis'
  | 'report_generated'
  | 'password_changed'
  | 'membership_changed'
  | 'login';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
