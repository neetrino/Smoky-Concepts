'use client';

import { Button } from '@shop/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../../lib/i18n-client';

export function QuickInfoCard() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="rounded-lg border border-[#dcc090]/30 bg-white/80 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 bg-[#122a26] rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-[#dcc090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#122a26]">{t('admin.quickSettings.usefulInformation')}</h3>
          <p className="text-xs text-[#414141]/55">{t('admin.quickSettings.aboutDiscounts')}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-[#414141]/70">
        <div className="flex items-start gap-2">
          <span className="text-[#122a26] mt-0.5">•</span>
          <p>{t('admin.quickSettings.discountApplies')}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[#122a26] mt-0.5">•</span>
          <p>{t('admin.quickSettings.discountExample')}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[#122a26] mt-0.5">•</span>
          <p>{t('admin.quickSettings.noDiscount')}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[#122a26] mt-0.5">•</span>
          <p>{t('admin.quickSettings.changesApplied')}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#dcc090]/25">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/settings')}
          className="w-full"
        >
          {t('admin.quickSettings.moreSettings')}
        </Button>
      </div>
    </div>
  );
}

