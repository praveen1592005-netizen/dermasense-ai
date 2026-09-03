import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Layers,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Star,
  ShoppingBag,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { userProductsService } from '../../services/userProductsService';
import { storeService } from '../../services/storeService';
import { Product } from '../../types/product';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MultiStoreOffersTable } from '../../components/products/MultiStoreOffersTable';
import { ExternalStorePromptModal } from '../../components/products/ExternalStorePromptModal';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showInfo } = useNotification();

  const userId = user?.id || 'usr_guest';
  const [product, setProduct] = useState<Product | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeModalOpen, setStoreModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!productId) return;
      setIsLoading(true);
      try {
        const p = await productService.getProductById(productId);
        setProduct(p);
        if (p) {
          const saved = await userProductsService.isProductSaved(userId, p.id);
          setIsSaved(saved);
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [productId, userId]);

  const handleToggleSave = async () => {
    if (!product) return;
    const nowSaved = await userProductsService.toggleSaveProduct(userId, product.id);
    setIsSaved(nowSaved);
    if (nowSaved) {
      showSuccess('Saved to Wishlist', 'Product added to your wishlist.');
    } else {
      showInfo('Removed', 'Product removed from your wishlist.');
    }
  };

  const handleAddToRoutine = async () => {
    if (!product) return;
    await userProductsService.addCurrentProduct({
      userId,
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      category: product.category,
      timeOfDay: 'morning',
      startDate: new Date().toISOString(),
      frequency: 'Daily',
      notes: `Added from recommendations (${product.brand}).`,
    });
    showSuccess('Added to Active Routine', `${product.name} logged into your routine vault.`);
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Sparkles className="w-10 h-10 text-brand-500 animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Loading product formulation details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <Card variant="glass" className="p-12 text-center max-w-xl mx-auto space-y-4">
        <ShoppingBag className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Product Not Found
        </h3>
        <p className="text-xs text-slate-500">
          The requested skincare product is not in the active catalog.
        </p>
        <Button variant="primary" onClick={() => navigate('/dashboard/products')}>
          Back to Products
        </Button>
      </Card>
    );
  }

  const bestOffer = product.offers.find((o) => o.isBestPrice) || product.offers[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn pb-16">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Catalog
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant={isSaved ? 'primary' : 'outline'}
            size="sm"
            onClick={handleToggleSave}
            leftIcon={<Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />}
          >
            {isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddToRoutine}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add to My Routine
          </Button>
        </div>
      </div>

      {/* Main Product Overview Card */}
      <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Product Image */}
          <div className="md:col-span-5 space-y-3">
            <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-darkBg-900 border border-slate-200 dark:border-slate-800 shadow-md relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-950/75 backdrop-blur-xs px-3 py-1 rounded-xl text-white text-xs font-bold">
                {product.brand}
              </div>
            </div>
          </div>

          {/* Right: Product Details & Pricing */}
          <div className="md:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand" size="md">
                  {product.category}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviewCount} reviews)</span>
                </div>
              </div>

              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Skin Compatibility & Concerns */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Suitable Skin Types:</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.skinTypes.map((st) => (
                    <Badge key={st} variant="neutral" size="sm">
                      {st}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Target Concerns:</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.concerns.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-0.5 rounded-lg bg-tealBrand-50 dark:bg-tealBrand-950/40 text-tealBrand-700 dark:text-tealBrand-300 text-[11px] border border-tealBrand-200/50"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Buy Now */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-darkBg-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 pt-4">
              <div>
                <span className="text-[11px] text-slate-400 block">Lowest Verified Price</span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {storeService.formatPriceINR(product.price)}
                </span>
              </div>

              <Button
                variant="gradient"
                size="lg"
                onClick={() => setStoreModalOpen(true)}
                rightIcon={<ExternalLink className="w-4 h-4" />}
              >
                Buy on {bestOffer ? bestOffer.store : 'Store'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Multi-Store Comparison Section */}
      <MultiStoreOffersTable productName={product.name} offers={product.offers} />

      {/* Verified Ingredients Breakdown */}
      <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-tealBrand-500" />
          Verified Formulation & Ingredient Profile
        </h3>

        <div className="flex flex-wrap gap-2">
          {product.ingredients.map((ing, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-xl bg-white dark:bg-darkBg-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs shadow-2xs"
            >
              {ing}
            </span>
          ))}
        </div>

        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Usage Instructions:
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {product.usageInstructions}
          </p>
        </div>
      </Card>

      {/* External Store Modal */}
      {bestOffer && (
        <ExternalStorePromptModal
          isOpen={storeModalOpen}
          onClose={() => setStoreModalOpen(false)}
          productName={product.name}
          storeName={bestOffer.store}
          purchaseUrl={bestOffer.purchaseUrl}
          price={bestOffer.price}
        />
      )}
    </div>
  );
};
