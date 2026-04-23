'use client';

import { Card } from '@shop/ui';
import { ADMIN_PRICE_CURRENCY } from '@/lib/currency';
import { useTranslation } from '../../../lib/i18n-client';
import { formatCurrency, formatDate } from '../utils/dashboardUtils';

interface UserActivity {
  recentRegistrations: Array<{
    id: string;
    email?: string;
    phone?: string;
    name: string;
    registeredAt: string;
    lastLoginAt?: string;
  }>;
  activeUsers: Array<{
    id: string;
    email?: string;
    phone?: string;
    name: string;
    orderCount: number;
    totalSpent: number;
    lastOrderDate: string;
    lastLoginAt?: string;
  }>;
}

interface UserActivityCardProps {
  userActivity: UserActivity | null;
  userActivityLoading: boolean;
}

export function UserActivityCard({ userActivity, userActivityLoading }: UserActivityCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="mb-8 border border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
      <h2 className="mb-6 text-xl font-black text-[#414141]">{t('admin.dashboard.userActivity')}</h2>
      {userActivityLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 rounded bg-[#dcc090]/30"></div>
            </div>
          ))}
        </div>
      ) : userActivity ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="mb-4 text-lg font-bold text-[#122a26]">{t('admin.dashboard.recentRegistrations')}</h3>
            <div className="space-y-3">
              {userActivity.recentRegistrations.length === 0 ? (
                <p className="text-sm text-[#414141]/70">{t('admin.dashboard.noRecentRegistrations')}</p>
              ) : (
                userActivity.recentRegistrations.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border border-[#dcc090]/25 bg-white/70 p-3">
                    <div>
                      <p className="text-sm font-bold text-[#122a26]">{user.name}</p>
                      <p className="text-xs text-[#414141]/75">{user.email || user.phone || 'N/A'}</p>
                      <p className="mt-1 text-xs text-[#414141]/55">{formatDate(user.registeredAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-[#122a26]">{t('admin.dashboard.mostActiveUsers')}</h3>
            <div className="space-y-3">
              {userActivity.activeUsers.length === 0 ? (
                <p className="text-sm text-[#414141]/70">{t('admin.dashboard.noActiveUsers')}</p>
              ) : (
                userActivity.activeUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border border-[#dcc090]/25 bg-white/70 p-3">
                    <div>
                      <p className="text-sm font-bold text-[#122a26]">{user.name}</p>
                      <p className="text-xs text-[#414141]/75">{user.email || user.phone || 'N/A'}</p>
                      <p className="mt-1 text-xs text-[#414141]/55">
                        {t('admin.dashboard.ordersCount').replace('{count}', user.orderCount.toString())} • {formatCurrency(user.totalSpent, ADMIN_PRICE_CURRENCY)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#414141]/70">{t('admin.dashboard.noUserActivityData')}</p>
      )}
    </Card>
  );
}

