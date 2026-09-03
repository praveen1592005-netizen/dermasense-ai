import React, { useState } from 'react';
import { ExternalLink, ShoppingBag, CheckCircle2, XCircle, Info, Sparkles } from 'lucide-react';
import { ProductStoreOffer, StoreName } from '../../types/product';
import { storeService } from '../../services/storeService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ExternalStorePromptModal } from './ExternalStorePromptModal';

interface MultiStoreOffersTableProps {
  productName: string;
  offers: ProductStoreOffer[];
}

export const MultiStoreOffersTable: React.FC<MultiStoreOffersTableProps> = ({
  productName,
  offers,
}) => {
  const [selectedOffer, setSelectedOffer] = useState<ProductStoreOffer | null>(null);

  if (!offers || offers.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-400 text-center">
        Store integration coming soon for this product.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-brand-500" />
          Where to Buy & Live Multi-Store Pricing
        </h4>
        <span className="text-[11px] text-slate-400">Verified Retailers</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-darkBg-850 overflow-hidden shadow-xs">
        {offers.map((offer, idx) => {
          const storeMeta = storeService.getStoreMetadata(offer.store);

          return (
            <div
              key={idx}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-darkBg-800/50 transition-colors"
            >
              {/* Store Identity & Delivery */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs" style={{ backgroundColor: storeMeta.iconBg }}>
                  {offer.store.substring(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {offer.storeDisplayName}
                    </span>
                    {offer.isBestPrice && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Best Price
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {offer.shippingInfo || storeMeta.standardDeliveryDays}
                  </p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3.5">
                <div className="text-left sm:text-right">
                  <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    {storeService.formatPriceINR(offer.price)}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>In Stock</span>
                  </div>
                </div>

                <Button
                  variant={offer.isBestPrice ? 'gradient' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedOffer(offer)}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Buy Online
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 italic">
        <Info className="w-3 h-3 flex-shrink-0" />
        <span>Price and stock availability are subject to change on the retailer's official website.</span>
      </div>

      {/* Safe External Store Departure Prompt */}
      {selectedOffer && (
        <ExternalStorePromptModal
          isOpen={Boolean(selectedOffer)}
          onClose={() => setSelectedOffer(null)}
          productName={productName}
          storeName={selectedOffer.store}
          purchaseUrl={selectedOffer.purchaseUrl}
          price={selectedOffer.price}
        />
      )}
    </div>
  );
};
