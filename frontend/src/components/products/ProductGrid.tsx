import React from 'react';
import { ShoppingBag, Search, Sparkles } from 'lucide-react';
import { Product } from '../../types/product';
import { ProductCard } from './ProductCard';
import { Button } from '../common/Button';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  savedProductIds?: string[];
  comparedProductIds?: string[];
  onToggleSave?: (productId: string) => void;
  onToggleCompare?: (product: Product) => void;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  savedProductIds = [],
  comparedProductIds = [],
  onToggleSave,
  onToggleCompare,
  onResetFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="p-5 rounded-3xl bg-white dark:bg-darkBg-850 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4"
          >
            <div className="aspect-square rounded-2xl bg-slate-200 dark:bg-darkBg-800" />
            <div className="h-4 bg-slate-200 dark:bg-darkBg-800 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-darkBg-800 rounded w-1/2" />
            <div className="h-8 bg-slate-200 dark:bg-darkBg-800 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-darkBg-850/40 max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto shadow-sm">
          <Search className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Products Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search terms, removing filter criteria, or selecting all stores.
          </p>
        </div>
        {onResetFilters && (
          <Button variant="secondary" size="sm" onClick={onResetFilters}>
            Reset All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isSaved={savedProductIds.includes(product.id)}
          isCompared={comparedProductIds.includes(product.id)}
          onToggleSave={onToggleSave}
          onToggleCompare={onToggleCompare}
        />
      ))}
    </div>
  );
};
