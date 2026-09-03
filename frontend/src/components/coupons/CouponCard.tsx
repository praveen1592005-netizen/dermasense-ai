import React, { useState } from 'react';
import { Tag, Copy, Check, Calendar, Sparkles, Clock } from 'lucide-react';
import { Coupon } from '../../types/coupon';
import { formatDate } from '../../utils/formatters';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useNotification } from '../../context/NotificationContext';

interface CouponCardProps {
  coupon: Coupon;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon }) => {
  const { showSuccess } = useNotification();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    showSuccess('Coupon Copied', `Promo code ${coupon.code} copied to clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = new Date(coupon.expiryDate).getTime() < Date.now() || coupon.status === 'expired';
  const isUsed = coupon.status === 'used';

  return (
    <Card
      variant="default"
      className={`p-5 rounded-3xl border flex flex-col justify-between relative overflow-hidden transition-all duration-200 ${
        isExpired || isUsed
          ? 'opacity-60 bg-slate-50 dark:bg-darkBg-900 border-slate-200 dark:border-slate-800'
          : 'border-brand-500/30 hover:border-brand-500/60 shadow-xs'
      }`}
    >
      {/* Top Banner Tag */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-brand-500 to-tealBrand-500 text-white shadow-2xs">
            {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
          </span>

          <Badge
            variant={
              isUsed
                ? 'neutral'
                : isExpired
                ? 'danger'
                : 'success'
            }
            size="sm"
          >
            {isUsed ? 'Used' : isExpired ? 'Expired' : 'Active Offer'}
          </Badge>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {coupon.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {coupon.description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>Expires: {formatDate(coupon.expiryDate)}</span>
        </div>
      </div>

      {/* Promo Code & Copy Action */}
      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-darkBg-800 border border-slate-200 dark:border-slate-700 font-mono font-extrabold text-xs text-slate-900 dark:text-white tracking-wider">
          {coupon.code}
        </div>

        <Button
          variant={copied ? 'teal' : isExpired || isUsed ? 'secondary' : 'outline'}
          size="sm"
          disabled={isExpired || isUsed}
          onClick={handleCopy}
          leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copied ? 'Copied' : isUsed ? 'Used' : 'Copy Code'}
        </Button>
      </div>
    </Card>
  );
};
