'use client';

import { Card } from '@shop/ui';
import { useTranslation } from '../../../../lib/i18n-client';
import { formatCurrency } from '../utils';
import type { AnalyticsData } from '../types';

interface TopProductsProps {
  products: AnalyticsData['topProducts'];
}

export function TopProducts({ products }: TopProductsProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-xl border border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#122a26]">{t('admin.analytics.topSellingProducts')}</h2>
        <div className="w-10 h-10 bg-[#122a26] rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-[#dcc090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </div>
      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#414141]/60">{t('admin.analytics.noSalesDataAvailable')}</p>
          </div>
        ) : (
          products.map((product, index) => (
            <div
              key={product.variantId}
              className="group flex items-center gap-4 rounded-xl border border-[#dcc090]/25 bg-white/70 p-4 transition-all duration-200 hover:border-[#dcc090] hover:bg-[#dcc090]/10 hover:shadow-md"
            >
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                  index === 0 ? 'bg-[#122a26] text-[#dcc090]' :
                  index === 1 ? 'bg-[#dcc090] text-[#122a26]' :
                  index === 2 ? 'bg-[#dcc090]/60 text-[#122a26]' :
                  'bg-[#dcc090]/25 text-[#414141]'
                }`}>
                  {index + 1}
                </div>
              </div>
              {product.image && (
                <div className="flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-14 h-14 object-cover rounded-lg border border-[#dcc090]/30 group-hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#122a26] truncate mb-1">{product.title}</p>
                <p className="text-xs text-[#414141]/55 mb-1">{t('admin.analytics.skuLabel')}: {product.sku}</p>
                <div className="flex items-center gap-3 text-xs text-[#414141]/65">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {t('admin.analytics.sold').replace('{count}', product.totalQuantity.toString())}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {t('admin.analytics.orders').replace('{count}', product.orderCount.toString())}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-[#122a26]">
                  {formatCurrency(product.totalRevenue)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}




