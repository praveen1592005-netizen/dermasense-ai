import { StoreName } from '../types/product';

export interface StoreMetadata {
  id: StoreName;
  displayName: string;
  badgeColor: string;
  iconBg: string;
  isIntegrated: boolean;
  standardDeliveryDays: string;
}

export const STORES: Record<StoreName, StoreMetadata> = {
  Amazon: {
    id: 'Amazon',
    displayName: 'Amazon India',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    iconBg: '#FF9900',
    isIntegrated: true,
    standardDeliveryDays: '1-2 Days (Prime)',
  },
  Nykaa: {
    id: 'Nykaa',
    displayName: 'Nykaa Beauty',
    badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    iconBg: '#FC2779',
    isIntegrated: true,
    standardDeliveryDays: '2-3 Days',
  },
  Tira: {
    id: 'Tira',
    displayName: 'Tira Beauty',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    iconBg: '#582C83',
    isIntegrated: true,
    standardDeliveryDays: '2-4 Days',
  },
  Myntra: {
    id: 'Myntra',
    displayName: 'Myntra Beauty',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    iconBg: '#FF3F6C',
    isIntegrated: true,
    standardDeliveryDays: '2-3 Days',
  },
  Flipkart: {
    id: 'Flipkart',
    displayName: 'Flipkart',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    iconBg: '#2874F0',
    isIntegrated: true,
    standardDeliveryDays: '3-4 Days',
  },
  Purplle: {
    id: 'Purplle',
    displayName: 'Purplle',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    iconBg: '#7A1EA1',
    isIntegrated: true,
    standardDeliveryDays: '2-4 Days',
  },
  'Official Store': {
    id: 'Official Store',
    displayName: 'Official Brand Store',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    iconBg: '#0D9488',
    isIntegrated: true,
    standardDeliveryDays: '2-5 Days',
  },
};

export const storeService = {
  getAvailableStores(): StoreMetadata[] {
    return Object.values(STORES);
  },

  getStoreMetadata(store: StoreName): StoreMetadata {
    return STORES[store] || STORES['Official Store'];
  },

  formatPriceINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  },
};
