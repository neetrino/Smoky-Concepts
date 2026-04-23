'use client';

import { Card, Button, Input } from '@shop/ui';
import { useTranslation } from '../../../../lib/i18n-client';

interface GlobalDiscountCardProps {
  globalDiscount: number;
  setGlobalDiscount: (value: number) => void;
  discountLoading: boolean;
  discountSaving: boolean;
  handleDiscountSave: () => void;
}

export function GlobalDiscountCard({
  globalDiscount,
  setGlobalDiscount,
  discountLoading,
  discountSaving,
  handleDiscountSave,
}: GlobalDiscountCardProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-[#dcc090]/30 bg-white/80 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 bg-[#122a26] rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-[#dcc090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#122a26]">{t('admin.quickSettings.globalDiscount')}</h3>
          <p className="text-xs text-[#414141]/55">{t('admin.quickSettings.forAllProducts')}</p>
        </div>
      </div>

      {discountLoading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-[#dcc090]/25 rounded"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={globalDiscount}
              onChange={(e) => {
                const value = e.target.value;
                setGlobalDiscount(value === '' ? 0 : parseFloat(value) || 0);
              }}
              className="flex-1"
              placeholder="0"
            />
            <span className="text-sm font-medium text-[#414141]/75 w-8">%</span>
            <Button
              variant="primary"
              onClick={handleDiscountSave}
              disabled={discountSaving}
              className="px-6"
            >
              {discountSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{t('admin.quickSettings.saving')}</span>
                </div>
              ) : (
                t('admin.quickSettings.save')
              )}
            </Button>
          </div>

          {globalDiscount > 0 ? (
            <div className="p-3 bg-[#122a26]/10 border border-[#122a26]/20 rounded-md">
              <p className="text-sm text-[#122a26]">
                <strong>{t('admin.quickSettings.active')}</strong> {t('admin.quickSettings.discountApplied').replace('{percent}', globalDiscount.toString())}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-[#dcc090]/15 border border-[#dcc090]/25 rounded-md">
              <p className="text-sm text-[#414141]/70">
                {t('admin.quickSettings.noGlobalDiscount')}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGlobalDiscount(10)}
              className="flex-1"
            >
              10%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGlobalDiscount(20)}
              className="flex-1"
            >
              20%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGlobalDiscount(30)}
              className="flex-1"
            >
              30%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGlobalDiscount(50)}
              className="flex-1"
            >
              50%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGlobalDiscount(0)}
              className="px-3"
            >
              {t('admin.quickSettings.cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

