import React from 'react';
import { Heart, Trash2, ExternalLink, Layers, ShoppingBag, ArrowRight } from 'lucide-react';
import { SavedProduct, Product } from '../../types/product';
import { storeService } from '../../services/storeService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface SavedProductsListProps {
  savedProducts: SavedProduct[];
  onRemove: (productId: string) => void;
  onViewProduct: (productId: string) => void;
  onCompare?: (product: Product) => void;
  onBrowseProducts: () => void;
}

export const SavedProductsList: React.FC<SavedProductsListProps> = ({
  savedProducts,
  onRemove,
  onViewProduct,
  onCompare,
  onBrowseProducts,
}) => {
  if (savedProducts.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-darkBg-850/40 max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
          <Heart className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Save recommended products while browsing to compare prices and monitor multi-store availability.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={onBrowseProducts}>
          Explore Recommended Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          Saved Wishlist ({savedProducts.length})
        </h4>
        <span className="text-xs text-slate-400">Personal Product Wishlist</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedProducts.map((item) => {
          const product = item.product;
          if (!product) return null;

          return (
            <Card
              key={item.id}
              variant="default"
              className="p-4 rounded-3xl border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <Badge variant="brand" size="sm">
                    {product.category}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => onRemove(product.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-3 mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h5
                      onClick={() => onViewProduct(product.id)}
                      className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-brand-600 cursor-pointer"
                    >
                      {product.name}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">{product.brand}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {storeService.formatPriceINR(product.price)}
                </span>

                <div className="flex items-center gap-1.5">
                  {onCompare && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCompare(product)}
                      leftIcon={<Layers className="w-3 h-3" />}
                    >
                      Compare
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onViewProduct(product.id)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
