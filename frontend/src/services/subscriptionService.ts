import { BillingRecord } from '../types/membership';

const BILLING_STORAGE_KEY = 'dermasense_billing_history_v5';

export const subscriptionService = {
  async getBillingHistory(userId: string = 'usr_guest'): Promise<BillingRecord[]> {
    try {
      const raw = localStorage.getItem(BILLING_STORAGE_KEY);
      if (!raw) {
        // Initial clean history
        const initial: BillingRecord[] = [
          {
            id: 'bill_01',
            userId,
            date: new Date().toISOString(),
            planName: 'Free Tier Subscription',
            amount: 0,
            currency: 'INR',
            status: 'paid',
            invoiceId: `INV-${Date.now().toString().slice(-6)}`,
            paymentMethod: 'Complimentary Tier',
          },
        ];
        localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      const list: BillingRecord[] = JSON.parse(raw);
      return list.filter((b) => b.userId === userId || !b.userId);
    } catch {
      return [];
    }
  },

  async recordTransaction(record: Omit<BillingRecord, 'id'>): Promise<BillingRecord> {
    const raw = localStorage.getItem(BILLING_STORAGE_KEY);
    const list: BillingRecord[] = raw ? JSON.parse(raw) : [];
    const newRecord: BillingRecord = {
      ...record,
      id: `bill_${Date.now()}`,
    };
    list.unshift(newRecord);
    localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(list));
    return newRecord;
  },
};
