import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Sparkles, ShoppingBag, CreditCard, UserCheck, Search, Filter } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { couponService } from '../../services/couponService';
import { useAuth } from '../../context/AuthContext';
import { Coupon, CouponStatus } from '../../types/coupon';
import { CouponCard } from '../../components/coupons/CouponCard';
import { Card } from '../../components/common/Card';

export const CouponsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || 'usr_guest';

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'used' | 'expired'>('available');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const list = await couponService.getCoupons(userId);
        setCoupons(list);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId]);

  const filteredCoupons = coupons.filter((c) => {
    if (activeTab === 'available') return c.status === 'available';
    if (activeTab === 'used') return c.status === 'used';
    return c.status === 'expired' || new Date(c.expiryDate).getTime() < Date.now();
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn pb-16">
      <PageHeader
        title="Promotional Coupons & Special Offers"
        subtitle="Exclusive member vouchers for plan upgrades, skincare formulations, and consultation discounts."
      />

      {/* Discovery Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 sm:p-5 rounded-3xl border-brand-500/20 flex items-center gap-3.5 shadow-xs">
          <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Membership Savings
            </h4>
            <p className="text-[11px] text-slate-400">Up to 30% OFF Premium plans</p>
          </div>
        </Card>

        <Card variant="glass" className="p-4 sm:p-5 rounded-3xl border-tealBrand-500/20 flex items-center gap-3.5 shadow-xs">
          <div className="p-3 rounded-2xl bg-tealBrand-500/10 text-tealBrand-500 border border-tealBrand-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Product Vouchers
            </h4>
            <p className="text-[11px] text-slate-400">Instant savings on partner orders</p>
          </div>
        </Card>

        <Card variant="glass" className="p-4 sm:p-5 rounded-3xl border-indigoBrand-500/20 flex items-center gap-3.5 shadow-xs">
          <div className="p-3 rounded-2xl bg-indigoBrand-500/10 text-indigoBrand-500 border border-indigoBrand-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Clinical Vouchers
            </h4>
            <p className="text-[11px] text-slate-400">₹100 OFF doctor consultations</p>
          </div>
        </Card>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-darkBg-850 border border-slate-200/80 dark:border-slate-800 w-full sm:w-auto self-start shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'available'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Available Coupons ({coupons.filter((c) => c.status === 'available').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('used')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'used'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Used Coupons ({coupons.filter((c) => c.status === 'used').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expired')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expired'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Expired
        </button>
      </div>

      {/* Coupon Cards Grid */}
      {filteredCoupons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCoupons.map((coupon) => (
            <CouponCard key={coupon.code} coupon={coupon} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-darkBg-850/40 max-w-md mx-auto space-y-3">
          <Tag className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No {activeTab} coupons
          </h4>
          <p className="text-xs text-slate-400">
            Check back later for seasonal promotional codes and partner discounts.
          </p>
        </div>
      )}
    </div>
  );
};
