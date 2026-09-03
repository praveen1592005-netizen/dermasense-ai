import React, { useState } from 'react';
import { Layers, X, ExternalLink, Sparkles, Check, Info } from 'lucide-react';
import { Product } from '../../types/product';
import { storeService } from '../../services/storeService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ExternalStorePromptModal } from '../products/ExternalStorePromptModal';

interface ProductComparisonTableProps {
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

export const ProductComparisonTable: React.FC<ProductComparisonTableProps> = ({
  products,
  onRemoveProduct,
  onClearAll,
}) => {
  const [activeStoreModal, setActiveStoreModal] = useState<{
    productName: string;
    store: any;
    url: string;
    price: number;
  } | null>(null);

  if (products.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-darkBg-850/40 max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto shadow-sm">
          <Layers className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Products Selected for Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click the "Compare" button on any 2 to 4 products in the catalog to inspect their formulations and multi-store pricing side-by-side.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" />
            Side-by-Side Product Comparison ({products.length} Products)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare active formulations, skin compatibility, and lowest retailer pricing.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={onClearAll}>
          Clear Comparison
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-darkBg-850 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-darkBg-900/60">
              <th className="p-4 w-44 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                Specification
              </th>
              {products.map((p) => (
                <th key={p.id} className="p-4 min-w-[220px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <Badge variant="brand" size="sm">
                        {p.category}
                      </Badge>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-2">
                        {p.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-normal">{p.brand}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveProduct(p.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove product"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Image Row */}
            <tr>
              <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Preview</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shadow-xs"
                  />
                </td>
              ))}
            </tr>

            {/* Price & Best Store */}
            <tr>
              <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Best Price</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {storeService.formatPriceINR(p.price)}
                    </span>
                    <p className="text-[10px] text-slate-400">via {p.store}</p>
                  </div>
                </td>
              ))}
            </tr>

            {/* Suitable Skin Types */}
            <tr>
              <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Skin Types</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {p.skinTypes.map((st) => (
                      <Badge key={st} variant="neutral" size="sm">
                        {st}
                      </Badge>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Target Concerns */}
            <tr>
              <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Target Concerns</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {p.concerns.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-md bg-tealBrand-50 dark:bg-tealBrand-950/40 text-tealBrand-700 dark:text-tealBrand-300 text-[10px] border border-tealBrand-200/50"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Key Actives */}
            <tr>
              <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Key Actives</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    {p.ingredients.slice(0, 4).map((ing, i) => (
                      <p key={i} className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span>{ing}</span>
                      </p>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Purchase CTA */}
            <tr>
              <td className="p-4 font-bold text-slate-500 dark:text-slate-400">Purchase</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() =>
                      setActiveStoreModal({
                        productName: p.name,
                        store: p.store,
                        url: p.purchaseUrl,
                        price: p.price,
                      })
                    }
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Buy Online
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked View */}
      <div className="md:hidden space-y-4">
        {products.map((p) => (
          <Card
            key={p.id}
            variant="default"
            className="p-5 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                />
                <div>
                  <Badge variant="brand" size="sm">
                    {p.category}
                  </Badge>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">{p.brand}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveProduct(p.id)}
                className="p-1 text-slate-400 hover:text-rose-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Best Price:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {storeService.formatPriceINR(p.price)} (via {p.store})
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Key Actives:</span>
                <div className="flex flex-wrap gap-1">
                  {p.ingredients.slice(0, 3).map((ing, i) => (
                    <Badge key={i} variant="neutral" size="sm">
                      {ing}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="gradient"
              size="sm"
              className="w-full"
              onClick={() =>
                setActiveStoreModal({
                  productName: p.name,
                  store: p.store,
                  url: p.purchaseUrl,
                  price: p.price,
                })
              }
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Buy on {p.store}
            </Button>
          </Card>
        ))}
      </div>

      {activeStoreModal && (
        <ExternalStorePromptModal
          isOpen={Boolean(activeStoreModal)}
          onClose={() => setActiveStoreModal(null)}
          productName={activeStoreModal.productName}
          storeName={activeStoreModal.store}
          purchaseUrl={activeStoreModal.url}
          price={activeStoreModal.price}
        />
      )}
    </div>
  );
};
