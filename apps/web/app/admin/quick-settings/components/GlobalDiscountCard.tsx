'use client';

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
          <div className="h-10 bg-[#dcc090]/25 rounded" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={globalDiscount}
              onChange={(e) => {
                const value = e.target.value;
                setGlobalDiscount(value === '' ? 0 : parseFloat(value) || 0);
              }}
              placeholder="0"
              className="flex-1 rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2 text-sm text-[#122a26] placeholder-[#414141]/30 outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
            />
            <span className="text-sm font-medium text-[#414141]/75 w-8">%</span>
            <button
              type="button"
              onClick={handleDiscountSave}
              disabled={discountSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#122a26] px-5 py-2 text-sm font-bold text-[#dcc090] shadow-[0_4px_14px_rgba(18,42,38,0.18)] transition-all hover:bg-[#18352f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {discountSaving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-b-2 border-[#dcc090]" />
                  {t('admin.quickSettings.saving')}
                </>
              ) : (
                t('admin.quickSettings.save')
              )}
            </button>
          </div>

          {globalDiscount > 0 ? (
            <div className="p-3 bg-[#122a26]/10 border border-[#122a26]/20 rounded-md">
              <p className="text-sm text-[#122a26]">
                <strong>{t('admin.quickSettings.active')}</strong>{' '}
                {t('admin.quickSettings.discountApplied').replace('{percent}', globalDiscount.toString())}
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
            {[10, 20, 30, 50].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setGlobalDiscount(pct)}
                className="flex-1 rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 py-1.5 text-xs font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090]"
              >
                {pct}%
              </button>
            ))}
            <button
              type="button"
              onClick={() => setGlobalDiscount(0)}
              className="rounded-lg border border-[#dcc090]/30 px-3 py-1.5 text-xs font-bold text-[#414141]/70 transition-all hover:border-[#dcc090]/50 hover:bg-[#dcc090]/10"
            >
              {t('admin.quickSettings.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
