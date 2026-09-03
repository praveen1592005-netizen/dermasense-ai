import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  ExternalLink,
  Layers,
  Star,
  Sparkles,
  Check,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { Product } from '../../types/product';
import { storeService } from '../../services/storeService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ExternalStorePromptModal } from './ExternalStorePromptModal';

interface ProductCardProps {
  product: Product;
  isSaved?: boolean;
  isCompared?: boolean;
  onToggleSave?: (productId: string) => void;
  onToggleCompare?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSaved = false,
  isCompared = false,
  onToggleSave,
  onToggleCompare,
}) => {
  const navigate = useNavigate();
  const [storeModalOpen, setStoreModalOpen] = useState(false);

  const bestOffer =
    product.offers.find((o) => o.isBestPrice) || product.offers[0] || null;

  return (
    <Card
      variant="default"
      className="p-4 sm:p-5 rounded-3xl flex flex-col justify-between border-slate-200/80 dark:border-slate-800 transition-all duration-200 hover:shadow-lg group"
    >
      <div>
        {/* Top Badges & Wishlist Trigger */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="brand" size="sm">
              {product.category}
            </Badge>
            {product.matchScore && product.matchScore >= 80 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-tealBrand-500/10 text-tealBrand-600 dark:text-tealBrand-400 border border-tealBrand-500/20 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> {product.matchScore}% Match
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleSave?.(product.id)}
            className={`p-2 rounded-xl transition-colors ${
              isSaved
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-darkBg-800 text-slate-400 hover:text-rose-500'
            }`}
            title={isSaved ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Product Image */}
        <div
          onClick={() => navigate(`/dashboard/products/${product.id}`)}
          className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-darkBg-900 border border-slate-200/60 dark:border-slate-800 relative cursor-pointer mb-3.5"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-2 left-2 bg-slate-950/70 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[10px] font-bold text-white">
            {product.brand}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-2">
          <h4
            onClick={() => navigate(`/dashboard/products/${product.id}`)}
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {product.name}
          </h4>

          {/* Skin Types & Concerns */}
          <div className="flex flex-wrap gap-1">
            {product.skinTypes.slice(0, 2).map((st) => (
              <span
                key={st}
                className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-darkBg-800 text-slate-600 dark:text-slate-400 text-[10px]"
              >
                {st}
              </span>
            ))}
          </div>

          {/* Key Ingredients */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            <strong className="text-slate-700 dark:text-slate-300">Actives:</strong>{' '}
            {product.ingredients.slice(0, 3).join(', ')}
          </p>

          {/* Recommendation Reason (Section 19) */}
          {product.recommendationReasons && product.recommendationReasons.length > 0 && (
            <p className="text-[10px] text-tealBrand-700 dark:text-tealBrand-300 bg-tealBrand-500/10 p-2 rounded-xl border border-tealBrand-500/20 line-clamp-2">
              💡 {product.recommendationReasons[0]}
            </p>
          )}
        </div>
      </div>

      {/* Pricing, Multi-Store info & Actions */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">From</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {storeService.formatPriceINR(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
            <Star className="w-3 h-3 fill-current" />
            <span>{product.rating}</span>
            <span className="text-slate-400 font-normal">({product.reviewCount})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={isCompared ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onToggleCompare?.(product)}
            leftIcon={<Layers className="w-3.5 h-3.5" />}
          >
            {isCompared ? 'Compared' : 'Compare'}
          </Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={() => setStoreModalOpen(true)}
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Buy Online
          </Button>
        </div>
      </div>

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
    </Card>
  );
};
