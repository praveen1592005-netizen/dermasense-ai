import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { ProductSortOption } from '../../types/product';
import { Select } from '../common/Select';

interface ProductSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOption: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  totalResults: number;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  totalResults,
}) => {
  const sortOptions = [
    { value: 'recommended', label: 'AI Recommended' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popularity', label: 'Most Popular' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Search Box */}
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search products by brand, ingredient, or concern..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sort & Count */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
          {totalResults} {totalResults === 1 ? 'Product' : 'Products'}
        </span>

        <div className="w-48">
          <Select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
            options={sortOptions}
          />
        </div>
      </div>
    </div>
  );
};
