import React from 'react';
import { ExternalLink, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StoreName } from '../../types/product';
import { storeService } from '../../services/storeService';

interface ExternalStorePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  storeName: StoreName;
  purchaseUrl: string;
  price?: number;
}

export const ExternalStorePromptModal: React.FC<ExternalStorePromptModalProps> = ({
  isOpen,
  onClose,
  productName,
  storeName,
  purchaseUrl,
  price,
}) => {
  const storeMeta = storeService.getStoreMetadata(storeName);

  const handleProceed = () => {
    window.open(purchaseUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Leaving DermaSense AI"
      description="You are navigating to an external verified retailer."
      size="md"
    >
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-darkBg-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Selected Retailer:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${storeMeta.badgeColor}`}>
              {storeMeta.displayName}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Product:</span>
            <span className="font-bold text-slate-900 dark:text-white block mt-0.5 truncate">
              {productName}
            </span>
          </div>

          {price && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-400 text-xs">Listed Price:</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {storeService.formatPriceINR(price)}
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Note: Prices, stock availability, and shipping timelines are managed directly by {storeMeta.displayName} and may vary. Always verify product ingredients on the merchant page before checkout.
        </p>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleProceed}
            rightIcon={<ExternalLink className="w-4 h-4" />}
          >
            Continue to {storeName}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
