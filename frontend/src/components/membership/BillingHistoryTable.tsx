import React from 'react';
import { FileText, Download, Receipt } from 'lucide-react';
import { BillingRecord } from '../../types/membership';
import { storeService } from '../../services/storeService';
import { formatDate } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useNotification } from '../../context/NotificationContext';

interface BillingHistoryTableProps {
  records: BillingRecord[];
}

export const BillingHistoryTable: React.FC<BillingHistoryTableProps> = ({ records }) => {
  const { showSuccess } = useNotification();

  const handleDownloadInvoice = (invoiceId: string) => {
    showSuccess('Invoice Downloaded', `Generated invoice receipt ${invoiceId}.`);
  };

  return (
    <Card variant="glass" className="p-6 sm:p-8 rounded-3xl border-slate-200/80 dark:border-slate-800 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-500" />
            Billing & Invoicing History
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified membership receipts and transaction history.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-darkBg-850">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-darkBg-900/60 text-slate-500">
              <th className="p-3.5 font-bold uppercase text-[10px]">Invoice ID</th>
              <th className="p-3.5 font-bold uppercase text-[10px]">Plan Description</th>
              <th className="p-3.5 font-bold uppercase text-[10px]">Date</th>
              <th className="p-3.5 font-bold uppercase text-[10px]">Amount</th>
              <th className="p-3.5 font-bold uppercase text-[10px]">Status</th>
              <th className="p-3.5 font-bold uppercase text-[10px] text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {records.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-darkBg-800/40">
                <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                  {rec.invoiceId}
                </td>
                <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                  {rec.planName}
                </td>
                <td className="p-3.5 text-slate-400">{formatDate(rec.date)}</td>
                <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                  {storeService.formatPriceINR(rec.amount)}
                </td>
                <td className="p-3.5">
                  <Badge variant="success" size="sm">
                    {rec.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="p-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => handleDownloadInvoice(rec.invoiceId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
                    title="Download invoice"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
