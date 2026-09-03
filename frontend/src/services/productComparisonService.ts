import { Product } from '../types/product';

export interface IngredientComparisonResult {
  sharedIngredients: string[];
  uniqueIngredients: Record<string, string[]>;
  totalUniqueCount: number;
}

export interface ProductComparisonMatrix {
  products: Product[];
  ingredientComparison: IngredientComparisonResult;
  priceComparison: {
    productId: string;
    lowestPrice: number;
    highestPrice: number;
    bestStore: string;
  }[];
}

export const productComparisonService = {
  /**
   * Compares 2-4 products across category, skin suitability, pricing, and active ingredients.
   */
  compareProducts(products: Product[]): ProductComparisonMatrix {
    if (products.length === 0) {
      return {
        products: [],
        ingredientComparison: { sharedIngredients: [], uniqueIngredients: {}, totalUniqueCount: 0 },
        priceComparison: [],
      };
    }

    // Compare ingredients
    const ingredientSets = products.map(
      (p) => new Set(p.ingredients.map((ing) => ing.toLowerCase().trim()))
    );

    // Shared across ALL products
    const sharedIngredients: string[] = [];
    const firstSet = ingredientSets[0];
    firstSet.forEach((ing) => {
      if (ingredientSets.every((set) => set.has(ing))) {
        sharedIngredients.push(ing);
      }
    });

    // Unique per product
    const uniqueIngredients: Record<string, string[]> = {};
    products.forEach((p, idx) => {
      const mySet = ingredientSets[idx];
      const othersSets = ingredientSets.filter((_, i) => i !== idx);
      const uniqueList: string[] = [];

      mySet.forEach((ing) => {
        if (!othersSets.some((other) => other.has(ing))) {
          uniqueList.push(ing);
        }
      });
      uniqueIngredients[p.id] = uniqueList;
    });

    // Price Comparison
    const priceComparison = products.map((p) => {
      const prices = p.offers.map((o) => o.price);
      const lowestPrice = Math.min(...prices);
      const highestPrice = Math.max(...prices);
      const bestOffer = p.offers.find((o) => o.price === lowestPrice);

      return {
        productId: p.id,
        lowestPrice,
        highestPrice,
        bestStore: bestOffer?.storeDisplayName || p.store,
      };
    });

    return {
      products,
      ingredientComparison: {
        sharedIngredients,
        uniqueIngredients,
        totalUniqueCount: Object.values(uniqueIngredients).flat().length,
      },
      priceComparison,
    };
  },
};
