import { SavedProduct, CurrentRoutineProductItem, Product } from '../types/product';
import { productService } from './productService';

const SAVED_PRODUCTS_KEY = 'dermasense_saved_products_v4';
const CURRENT_PRODUCTS_KEY = 'dermasense_current_routine_products_v4';

export const userProductsService = {
  // --- SAVED PRODUCTS / WISHLIST ---
  async getSavedProducts(userId: string): Promise<SavedProduct[]> {
    try {
      const raw = localStorage.getItem(SAVED_PRODUCTS_KEY);
      if (!raw) return [];
      const list: SavedProduct[] = JSON.parse(raw);
      const userList = list.filter((item) => item.userId === userId || !item.userId);

      const allProducts = await productService.getProducts();

      // Hydrate with latest product details
      return userList.map((item) => ({
        ...item,
        product: allProducts.find((p) => p.id === item.productId),
      }));
    } catch {
      return [];
    }
  },

  async isProductSaved(userId: string, productId: string): Promise<boolean> {
    const list = await this.getSavedProducts(userId);
    return list.some((item) => item.productId === productId);
  },

  async toggleSaveProduct(userId: string, productId: string): Promise<boolean> {
    try {
      const raw = localStorage.getItem(SAVED_PRODUCTS_KEY);
      const list: SavedProduct[] = raw ? JSON.parse(raw) : [];
      const existingIdx = list.findIndex(
        (item) => item.productId === productId && (item.userId === userId || !item.userId)
      );

      if (existingIdx >= 0) {
        list.splice(existingIdx, 1);
        localStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(list));
        return false; // Removed
      } else {
        list.unshift({
          id: `saved_${Date.now()}`,
          productId,
          userId,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem(SAVED_PRODUCTS_KEY, JSON.stringify(list));
        return true; // Added
      }
    } catch {
      return false;
    }
  },

  // --- MY CURRENT PRODUCTS (ROUTINE VAULT) ---
  async getCurrentProducts(userId: string): Promise<CurrentRoutineProductItem[]> {
    try {
      const raw = localStorage.getItem(CURRENT_PRODUCTS_KEY);
      if (!raw) {
        // Initial default setup from baseline
        const initial: CurrentRoutineProductItem[] = [
          {
            id: 'cur_01',
            userId,
            productName: 'CeraVe Hydrating Cleanser',
            brand: 'CeraVe',
            category: 'Cleanser',
            timeOfDay: 'both',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            frequency: 'Twice Daily (AM & PM)',
            notes: 'Gentle on skin barrier, leaves face hydrated.',
          },
          {
            id: 'cur_02',
            userId,
            productName: 'The Derma Co 1% Hyaluronic Sunscreen Aqua Gel SPF 50',
            brand: 'The Derma Co',
            category: 'Sunscreen',
            timeOfDay: 'morning',
            startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            frequency: 'Daily (Morning)',
            notes: 'Zero white cast, non-sticky texture.',
          },
        ];
        localStorage.setItem(CURRENT_PRODUCTS_KEY, JSON.stringify(initial));
        return initial;
      }
      const list: CurrentRoutineProductItem[] = JSON.parse(raw);
      return list.filter((item) => item.userId === userId || !item.userId);
    } catch {
      return [];
    }
  },

  async addCurrentProduct(item: Omit<CurrentRoutineProductItem, 'id'>): Promise<CurrentRoutineProductItem> {
    const raw = localStorage.getItem(CURRENT_PRODUCTS_KEY);
    const list: CurrentRoutineProductItem[] = raw ? JSON.parse(raw) : [];
    const newItem: CurrentRoutineProductItem = {
      ...item,
      id: `cur_${Date.now()}`,
    };
    list.unshift(newItem);
    localStorage.setItem(CURRENT_PRODUCTS_KEY, JSON.stringify(list));
    return newItem;
  },

  async removeCurrentProduct(id: string): Promise<boolean> {
    try {
      const raw = localStorage.getItem(CURRENT_PRODUCTS_KEY);
      if (!raw) return true;
      const list: CurrentRoutineProductItem[] = JSON.parse(raw);
      const filtered = list.filter((item) => item.id !== id);
      localStorage.setItem(CURRENT_PRODUCTS_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },
};
