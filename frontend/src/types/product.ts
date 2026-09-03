export type ProductCategory =
  | 'Cleanser'
  | 'Moisturizer'
  | 'Sunscreen'
  | 'Serum'
  | 'Toner'
  | 'Face Mask'
  | 'Treatment'
  | 'Eye Care'
  | 'Other';

export type StoreName =
  | 'Amazon'
  | 'Nykaa'
  | 'Tira'
  | 'Myntra'
  | 'Flipkart'
  | 'Purplle'
  | 'Official Store';

export interface ProductStoreOffer {
  store: StoreName;
  storeDisplayName: string;
  price: number;
  currency: string; // 'INR'
  inStock: boolean;
  purchaseUrl: string;
  shippingInfo?: string;
  isBestPrice?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  skinTypes: string[]; // e.g. ['Combination', 'Oily', 'Sensitive']
  concerns: string[]; // e.g. ['Acne & Breakouts', 'Hyperpigmentation & Dark Spots']
  ingredients: string[];
  usageInstructions: string;
  price: number;
  currency: string;
  image: string;
  store: StoreName;
  purchaseUrl: string;
  availability: 'in_stock' | 'out_of_stock' | 'unknown';
  rating: number;
  reviewCount: number;
  offers: ProductStoreOffer[];
  matchScore?: number; // Calculated dynamically by recommendation engine
  recommendationReasons?: string[];
  region: string;
  updatedAt: string;
}

export interface ProductFilter {
  category?: string;
  skinType?: string;
  concern?: string;
  priceRange?: 'under_500' | '500_1000' | '1000_2000' | 'above_2000' | 'all';
  store?: string;
  searchQuery?: string;
}

export type ProductSortOption =
  | 'recommended'
  | 'price_low'
  | 'price_high'
  | 'rating'
  | 'popularity'
  | 'recently_added';

export interface SavedProduct {
  id: string;
  productId: string;
  userId: string;
  savedAt: string;
  notes?: string;
  product?: Product;
}

export interface CurrentRoutineProductItem {
  id: string;
  userId: string;
  productId?: string;
  productName: string;
  brand?: string;
  category: ProductCategory;
  timeOfDay: 'morning' | 'evening' | 'both';
  startDate: string;
  frequency: string;
  notes?: string;
}
