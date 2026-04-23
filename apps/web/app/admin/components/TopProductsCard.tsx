'use client';

import { Card, Button } from '@shop/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../lib/i18n-client';
import { formatCurrency } from '../utils/dashboardUtils';

interface TopProduct {
  variantId: string;
  productId: string;
  title: string;
  sku: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  image?: string | null;
}

interface TopProductsCardProps {
  topProducts: TopProduct[];
  topProductsLoading: boolean;
}

export function TopProductsCard({ topProducts, topProductsLoading }: TopProductsCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Card className="border border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-[#414141]">{t('admin.dashboard.topSellingProducts')}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#122a26] hover:bg-[#dcc090]/15 hover:text-[#122a26]"
          onClick={() => router.push('/admin/products')}
        >
          {t('admin.dashboard.viewAll')}
        </Button>
      </div>
      <div className="space-y-4">
        {topProductsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 rounded bg-[#dcc090]/30"></div>
              </div>
            ))}
          </div>
        ) : topProducts.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#414141]/70">
            <p>{t('admin.dashboard.noSalesData')}</p>
          </div>
        ) : (
          topProducts.map((product, index) => (
            <div
              key={product.variantId}
              className="flex cursor-pointer items-center gap-4 rounded-lg border border-[#dcc090]/25 bg-white/70 p-3 transition-colors hover:border-[#dcc090] hover:bg-[#dcc090]/10"
              onClick={() => router.push(`/admin/products/${product.productId}`)}
            >
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-[#122a26] text-xs font-black text-[#dcc090]">
                  {index + 1}
                </div>
              </div>
              {product.image && (
                <div className="flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-[#122a26]">{product.title}</p>
                <p className="text-xs text-[#414141]/75">SKU: {product.sku}</p>
                <p className="mt-1 text-xs text-[#414141]/55">
                  {t('admin.dashboard.sold').replace('{count}', product.totalQuantity.toString())} • {t('admin.dashboard.orders').replace('{count}', product.orderCount.toString())}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#122a26]">
                  {formatCurrency(product.totalRevenue, 'USD')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

