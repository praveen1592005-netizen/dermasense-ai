import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';
import { ProductFilter, ProductCategory, StoreName } from '../../types/product';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

interface ProductFiltersProps {
  filter: ProductFilter;
  onChange: (updated: ProductFilter) => void;
  onReset: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filter,
  onChange,
  onReset,
}) => {
  const update = (field: keyof ProductFilter, val: string) => {
    onChange({
      ...filter,
      [field]: val,
    });
  };

  const categories: { value: string; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'Cleanser', label: 'Cleansers' },
    { value: 'Moisturizer', label: 'Moisturizers' },
    { value: 'Sunscreen', label: 'Sunscreens (SPF)' },
    { value: 'Serum', label: 'Serums & Treatments' },
    { value: 'Toner', label: 'Toners & Essences' },
    { value: 'Face Mask', label: 'Face Masks' },
  ];

  const skinTypes = [
    { value: 'all', label: 'All Skin Types' },
    { value: 'Combination', label: 'Combination' },
    { value: 'Oily', label: 'Oily' },
    { value: 'Dry', label: 'Dry' },
    { value: 'Sensitive', label: 'Sensitive' },
    { value: 'Normal', label: 'Normal' },
  ];

  const concerns = [
    { value: 'all', label: 'All Skin Concerns' },
    { value: 'Hyperpigmentation & Dark Spots', label: 'Dark Spots & Pigmentation' },
    { value: 'Dryness & Flaking', label: 'Dryness & Flaking' },
    { value: 'Oiliness & Shine', label: 'Oiliness & Shine' },
    { value: 'Acne & Breakouts', label: 'Acne & Blemishes' },
    { value: 'Skin Sensitivity', label: 'Redness & Sensitivity' },
    { value: 'Fine Lines & Wrinkles', label: 'Fine Lines & Aging' },
    { value: 'Large-looking Pores', label: 'Large Pores' },
  ];

  const priceRanges = [
    { value: 'all', label: 'All Price Ranges' },
    { value: 'under_500', label: 'Under ₹500' },
    { value: '500_1000', label: '₹500 – ₹1,000' },
    { value: '1000_2000', label: '₹1,000 – ₹2,000' },
    { value: 'above_2000', label: 'Above ₹2,000' },
  ];

  const stores = [
    { value: 'all', label: 'All Stores' },
    { value: 'Amazon', label: 'Amazon India' },
    { value: 'Nykaa', label: 'Nykaa Beauty' },
    { value: 'Tira', label: 'Tira Beauty' },
    { value: 'Myntra', label: 'Myntra' },
    { value: 'Flipkart', label: 'Flipkart' },
    { value: 'Official Store', label: 'Official Brand Stores' },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-brand-500" />
          Filter Products
        </h4>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Select
          label="Category"
          value={filter.category || 'all'}
          onChange={(e) => update('category', e.target.value)}
          options={categories}
        />

        <Select
          label="Skin Type"
          value={filter.skinType || 'all'}
          onChange={(e) => update('skinType', e.target.value)}
          options={skinTypes}
        />

        <Select
          label="Target Concern"
          value={filter.concern || 'all'}
          onChange={(e) => update('concern', e.target.value)}
          options={concerns}
        />

        <Select
          label="Price Budget"
          value={filter.priceRange || 'all'}
          onChange={(e) => update('priceRange', e.target.value)}
          options={priceRanges}
        />

        <Select
          label="Verified Store"
          value={filter.store || 'all'}
          onChange={(e) => update('store', e.target.value)}
          options={stores}
        />
      </div>
    </div>
  );
};
