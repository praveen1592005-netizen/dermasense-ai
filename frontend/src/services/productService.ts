import { Product, ProductFilter, ProductSortOption } from '../types/product';
import { apiClient } from './apiClient';

export const productService = {
  async getProducts(filter?: ProductFilter, sort?: ProductSortOption): Promise<Product[]> {
    try {
      // In a full implementation, filter/sort would be passed as query params
      const response = await apiClient.get('/store/products');
      let list: Product[] = [];
      if (response.success && response.products) {
        list = response.products;
      }
      
      // Perform local filtering if backend doesn't support it yet
      if (filter) {
        if (filter.category && filter.category !== 'all') {
          list = list.filter((p) => p.category?.toLowerCase() === filter.category?.toLowerCase());
        }
        if (filter.skinType && filter.skinType !== 'all') {
          list = list.filter((p) =>
            (p.skinTypes || []).some((st) => st.toLowerCase() === filter.skinType?.toLowerCase())
          );
        }
      }
      return list;
    } catch (e) {
      console.error('Failed to fetch products', e);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  },

  async getRecommendedProducts(
    userSkinType: string = 'combination',
    userConcerns: string[] = ['Hyperpigmentation & Dark Spots'],
    budgetPreference?: string
  ): Promise<Product[]> {
    // Ideally this would be an AI-driven endpoint /store/recommendations
    const all = await this.getProducts();
    
    // Fallback basic local logic for now
    const scored = all.map((p) => {
      let score = 50;
      const reasons: string[] = [];
      
      const typeMatch = p.skinTypes?.some(
        (st) => st.toLowerCase() === userSkinType.toLowerCase()
      );
      if (typeMatch) {
        score += 25;
        reasons.push(`Formulated specifically for ${userSkinType} skin characteristics.`);
      }
      
      return {
        ...p,
        matchScore: score,
        recommendationReasons: reasons,
      };
    });

    return scored.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  },
};
