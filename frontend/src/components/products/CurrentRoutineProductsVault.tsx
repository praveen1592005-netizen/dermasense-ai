import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Sun, Moon, Calendar, Droplets } from 'lucide-react';
import { CurrentRoutineProductItem, ProductCategory } from '../../types/product';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { formatDate } from '../../utils/formatters';

interface CurrentRoutineProductsVaultProps {
  currentProducts: CurrentRoutineProductItem[];
  onAddProduct: (item: Omit<CurrentRoutineProductItem, 'id'>) => Promise<void>;
  onRemoveProduct: (id: string) => Promise<void>;
}

export const CurrentRoutineProductsVault: React.FC<CurrentRoutineProductsVaultProps> = ({
  currentProducts,
  onAddProduct,
  onRemoveProduct,
}) => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Cleanser');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening' | 'both'>('morning');
  const [frequency, setFrequency] = useState('Daily (Morning)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddProduct({
        userId: '',
        productName: productName.trim(),
        brand: brand.trim() || undefined,
        category,
        timeOfDay,
        startDate: new Date().toISOString(),
        frequency,
        notes: notes.trim() || undefined,
      });
      setAddModalOpen(false);
      setProductName('');
      setBrand('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const morningList = currentProducts.filter(
    (p) => p.timeOfDay === 'morning' || p.timeOfDay === 'both'
  );
  const eveningList = currentProducts.filter(
    (p) => p.timeOfDay === 'evening' || p.timeOfDay === 'both'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            My Active Skincare Routine Vault
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Keep an accurate log of commercial products you apply daily to correlate with your skin progress.
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          onClick={() => setAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Product to Routine
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Morning Regimen Card */}
        <Card variant="glass" className="p-5 sm:p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Morning Routine ({morningList.length})
            </h5>
            <span className="text-[11px] text-slate-400">AM Protocol</span>
          </div>

          {morningList.length > 0 ? (
            <div className="space-y-3">
              {morningList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h6 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </h6>
                      <Badge variant="brand" size="sm">
                        {item.category}
                      </Badge>
                    </div>
                    {item.brand && (
                      <p className="text-[11px] text-slate-400 font-medium">{item.brand}</p>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.frequency} • Started {formatDate(item.startDate)}
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-0.5">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveProduct(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
                    title="Remove from routine"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-4">
              No morning products recorded yet.
            </p>
          )}
        </Card>

        {/* Evening Regimen Card */}
        <Card variant="glass" className="p-5 sm:p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigoBrand-500" />
              Evening Routine ({eveningList.length})
            </h5>
            <span className="text-[11px] text-slate-400">PM Protocol</span>
          </div>

          {eveningList.length > 0 ? (
            <div className="space-y-3">
              {eveningList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-darkBg-900/60 border border-slate-200/60 dark:border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h6 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </h6>
                      <Badge variant="teal" size="sm">
                        {item.category}
                      </Badge>
                    </div>
                    {item.brand && (
                      <p className="text-[11px] text-slate-400 font-medium">{item.brand}</p>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.frequency} • Started {formatDate(item.startDate)}
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-0.5">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveProduct(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
                    title="Remove from routine"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-4">
              No evening products recorded yet.
            </p>
          )}
        </Card>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Product to Active Routine"
        description="Log products currently in your medicine cabinet or beauty shelf."
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Product Name"
            placeholder="e.g. CeraVe Moisturizing Cream"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />

          <Input
            label="Brand / Manufacturer"
            placeholder="e.g. CeraVe, Minimalist, Cetaphil"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Product Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              options={[
                { value: 'Cleanser', label: 'Cleanser' },
                { value: 'Moisturizer', label: 'Moisturizer' },
                { value: 'Sunscreen', label: 'Sunscreen (SPF)' },
                { value: 'Serum', label: 'Serum / Treatment' },
                { value: 'Toner', label: 'Toner' },
                { value: 'Face Mask', label: 'Face Mask' },
                { value: 'Other', label: 'Other' },
              ]}
            />

            <Select
              label="Application Routine"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as any)}
              options={[
                { value: 'morning', label: 'Morning (AM)' },
                { value: 'evening', label: 'Evening (PM)' },
                { value: 'both', label: 'Both (AM & PM)' },
              ]}
            />
          </div>

          <Select
            label="Usage Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            options={[
              { value: 'Daily (Every Morning)', label: 'Daily (Every Morning)' },
              { value: 'Daily (Every Evening)', label: 'Daily (Every Evening)' },
              { value: 'Twice Daily (AM & PM)', label: 'Twice Daily (AM & PM)' },
              { value: '2-3 Times a Week', label: '2-3 Times a Week' },
              { value: 'Weekly Treatment', label: 'Weekly Treatment' },
            ]}
          />

          <Input
            label="Personal Notes / Observations (Optional)"
            placeholder="e.g. Started using after consultation, pleasant texture."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Add to Routine
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
