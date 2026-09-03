import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Sparkles,
  Search,
  Filter,
  Heart,
  Layers,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { productService } from '../../services/productService';
import { userProductsService } from '../../services/userProductsService';
import {
  Product,
  ProductFilter,
  ProductSortOption,
  SavedProduct,
  CurrentRoutineProductItem,
} from '../../types/product';

// Reusable Components
import { ProductSearchBar } from '../../components/products/ProductSearchBar';
import { ProductFilters } from '../../components/products/ProductFilters';
import { ProductGrid } from '../../components/products/ProductGrid';
import { SavedProductsList } from '../../components/products/SavedProductsList';
import { CurrentRoutineProductsVault } from '../../components/products/CurrentRoutineProductsVault';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showInfo } = useNotification();

  const userId = user?.id || 'usr_guest';
  const userSkinType = user?.profile?.skinProfile?.skinType || user?.profile?.skinType || 'combination';
  const userConcerns = user?.profile?.skinProfile?.primaryConcerns || ['Hyperpigmentation & Dark Spots'];

  // Tabs: 'recommended' | 'all' | 'saved' | 'my_routine'
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'saved' | 'my_routine'>('recommended');

  const [products, setProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [currentProducts, setCurrentProducts] = useState<CurrentRoutineProductItem[]>([]);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<ProductSortOption>('recommended');
  const [filter, setFilter] = useState<ProductFilter>({
    category: 'all',
    skinType: 'all',
    concern: 'all',
    priceRange: 'all',
    store: 'all',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load catalog, recommendations, saved and current products on mount
  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      try {
        const [cat, rec, saved, cur] = await Promise.all([
          productService.getProducts(filter, sortOption),
          productService.getRecommendedProducts(userSkinType, userConcerns),
          userProductsService.getSavedProducts(userId),
          userProductsService.getCurrentProducts(userId),
        ]);
        setProducts(cat);
        setRecommendedProducts(rec);
        setSavedProducts(saved);
        setCurrentProducts(cur);
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, [userSkinType, userId]);

  // Refetch products when filter, search, or sort changes
  useEffect(() => {
    const fetchFiltered = async () => {
      setIsLoading(true);
      try {
        const data = await productService.getProducts(
          { ...filter, searchQuery },
          sortOption
        );
        setProducts(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiltered();
  }, [filter, searchQuery, sortOption]);

  const handleToggleSave = async (productId: string) => {
    const isNowSaved = await userProductsService.toggleSaveProduct(userId, productId);
    const updated = await userProductsService.getSavedProducts(userId);
    setSavedProducts(updated);

    if (isNowSaved) {
      showSuccess('Saved to Wishlist', 'Product added to your saved products.');
    } else {
      showInfo('Removed', 'Product removed from your wishlist.');
    }
  };

  const handleToggleCompare = (product: Product) => {
    const isAlready = comparedProducts.some((p) => p.id === product.id);
    if (isAlready) {
      setComparedProducts(comparedProducts.filter((p) => p.id !== product.id));
    } else {
      if (comparedProducts.length >= 4) {
        showInfo('Compare Limit', 'You can compare up to 4 products at a time.');
        return;
      }
      setComparedProducts([...comparedProducts, product]);
      showSuccess('Added to Compare', `Added ${product.name} to comparison.`);
    }
  };

  const handleAddCurrentProduct = async (item: Omit<CurrentRoutineProductItem, 'id'>) => {
    await userProductsService.addCurrentProduct({ ...item, userId });
    const updated = await userProductsService.getCurrentProducts(userId);
    setCurrentProducts(updated);
    showSuccess('Product Added', 'Product logged into your active routine.');
  };

  const handleRemoveCurrentProduct = async (id: string) => {
    await userProductsService.removeCurrentProduct(id);
    const updated = await userProductsService.getCurrentProducts(userId);
    setCurrentProducts(updated);
    showInfo('Removed', 'Product removed from your routine.');
  };

  const handleResetFilters = () => {
    setFilter({
      category: 'all',
      skinType: 'all',
      concern: 'all',
      priceRange: 'all',
      store: 'all',
    });
    setSearchQuery('');
  };

  const savedProductIds = useMemo(() => savedProducts.map((p) => p.productId), [savedProducts]);
  const comparedProductIds = useMemo(() => comparedProducts.map((p) => p.id), [comparedProducts]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-16">
      <PageHeader
        title="Skincare Products & Multi-Store Shopping"
        subtitle="Discover dermatologist-aligned formulations, compare multi-store pricing in INR, and log your active routine."
        actions={
          comparedProducts.length > 0 ? (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => navigate('/dashboard/compare', { state: { products: comparedProducts } })}
              leftIcon={<Layers className="w-4 h-4" />}
            >
              Compare ({comparedProducts.length}) Products
            </Button>
          ) : undefined
        }
      />

      {/* Main Tabs Header */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('recommended')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'recommended'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Recommended For You</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>All Products ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'saved'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-800'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({savedProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my_routine')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'my_routine'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkBg-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>My Active Routine ({currentProducts.length})</span>
        </button>
      </div>

      {/* TAB 1: AI RECOMMENDED */}
      {activeTab === 'recommended' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-3xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Personalized Formulations for {userSkinType.toUpperCase()} Skin
              </h4>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                Matched to your skin profile, barrier priorities, and stated focus concerns ({userConcerns.join(', ')}).
              </p>
            </div>
            <Badge variant="brand" size="md">
              AI Scored
            </Badge>
          </div>

          <ProductGrid
            products={recommendedProducts}
            isLoading={isLoading}
            savedProductIds={savedProductIds}
            comparedProductIds={comparedProductIds}
            onToggleSave={handleToggleSave}
            onToggleCompare={handleToggleCompare}
          />
        </div>
      )}

      {/* TAB 2: ALL PRODUCTS CATALOG */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          <ProductSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOption={sortOption}
            onSortChange={setSortOption}
            totalResults={products.length}
          />

          <ProductFilters
            filter={filter}
            onChange={setFilter}
            onReset={handleResetFilters}
          />

          <ProductGrid
            products={products}
            isLoading={isLoading}
            savedProductIds={savedProductIds}
            comparedProductIds={comparedProductIds}
            onToggleSave={handleToggleSave}
            onToggleCompare={handleToggleCompare}
            onResetFilters={handleResetFilters}
          />
        </div>
      )}

      {/* TAB 3: SAVED WISHLIST */}
      {activeTab === 'saved' && (
        <SavedProductsList
          savedProducts={savedProducts}
          onRemove={handleToggleSave}
          onViewProduct={(id) => navigate(`/dashboard/products/${id}`)}
          onCompare={handleToggleCompare}
          onBrowseProducts={() => setActiveTab('all')}
        />
      )}

      {/* TAB 4: MY CURRENT ROUTINE VAULT */}
      {activeTab === 'my_routine' && (
        <CurrentRoutineProductsVault
          currentProducts={currentProducts}
          onAddProduct={handleAddCurrentProduct}
          onRemoveProduct={handleRemoveCurrentProduct}
        />
      )}

      {/* Persistent Compare Floating Bar */}
      {comparedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white dark:bg-darkBg-850/95 border border-slate-700 backdrop-blur-md px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-4 animate-slideUp">
          <span className="text-xs font-bold whitespace-nowrap">
            {comparedProducts.length} Products Selected
          </span>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => navigate('/dashboard/compare', { state: { products: comparedProducts } })}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Compare Now
          </Button>
          <button
            type="button"
            onClick={() => setComparedProducts([])}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
