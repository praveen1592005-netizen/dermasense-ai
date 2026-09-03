import React, { useState } from 'react';
import { History, Plus, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';
import { RoutineChangeLog } from '../../types/progress';
import { formatDate } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

interface RoutineChangeTimelineProps {
  logs: RoutineChangeLog[];
  onAddLog: (log: Omit<RoutineChangeLog, 'id'>) => Promise<void>;
}

export const RoutineChangeTimeline: React.FC<RoutineChangeTimelineProps> = ({
  logs,
  onAddLog,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Serum');
  const [action, setAction] = useState<'added' | 'removed' | 'frequency_changed' | 'routine_started'>('added');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddLog({
        userId: '',
        date: new Date().toISOString(),
        action,
        productName: productName.trim(),
        category,
        reason: reason.trim() || undefined,
      });
      setModalOpen(false);
      setProductName('');
      setReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionBadge = (act: string) => {
    switch (act) {
      case 'added':
        return <Badge variant="success" size="sm">+ Product Added</Badge>;
      case 'removed':
        return <Badge variant="danger" size="sm">- Removed</Badge>;
      case 'frequency_changed':
        return <Badge variant="warning" size="sm">Frequency Changed</Badge>;
      default:
        return <Badge variant="brand" size="sm">Routine Started</Badge>;
    }
  };

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" />
            Product & Routine Change Timeline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Maintain a chronological diary of products introduced or retired from your regimen.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Record Routine Change
        </Button>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {logs.map((log) => (
          <div key={log.id} className="relative space-y-1 text-xs">
            {/* Timeline Dot */}
            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-brand-500/20" />

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                {log.productName}
              </span>
              {getActionBadge(log.action)}
              <span className="text-[11px] text-slate-400">({formatDate(log.date)})</span>
            </div>

            {log.reason && (
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed pt-0.5">
                Note: {log.reason}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Record Change Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Routine Change"
        description="Log a product adjustment to monitor its impact over time."
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Product Name"
            placeholder="e.g. 10% Vitamin C Face Serum"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Action Type"
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              options={[
                { value: 'added', label: 'Added New Product' },
                { value: 'removed', label: 'Stopped Using' },
                { value: 'frequency_changed', label: 'Changed Frequency' },
                { value: 'routine_started', label: 'Started New Routine' },
              ]}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Cleanser', label: 'Cleanser' },
                { value: 'Moisturizer', label: 'Moisturizer' },
                { value: 'Sunscreen', label: 'Sunscreen' },
                { value: 'Serum', label: 'Serum' },
                { value: 'Toner', label: 'Toner' },
                { value: 'Face Mask', label: 'Face Mask' },
              ]}
            />
          </div>

          <Input
            label="Reason / Goal for Change"
            placeholder="e.g. Added antioxidant serum to target dark spots."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save to Timeline
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
