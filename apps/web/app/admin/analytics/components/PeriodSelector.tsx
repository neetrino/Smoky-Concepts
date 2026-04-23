'use client';

import { Card } from '@shop/ui';
import { useTranslation } from '../../../../lib/i18n-client';
import { formatDate } from '../utils';
import type { AnalyticsData } from '../types';

interface PeriodSelectorProps {
  period: string;
  startDate: string;
  endDate: string;
  analytics: AnalyticsData | null;
  onPeriodChange: (period: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function PeriodSelector({
  period,
  startDate,
  endDate,
  analytics,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
}: PeriodSelectorProps) {
  const { t } = useTranslation();

  return (
    <Card className="mb-6 rounded-xl border border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-[#122a26]">{t('admin.analytics.timePeriod')}</h2>
        {analytics && (
          <div className="text-sm text-[#414141]/70 bg-[#dcc090]/15 px-3 py-1.5 rounded-lg">
            {formatDate(analytics.dateRange.start)} - {formatDate(analytics.dateRange.end)}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-[#414141]/75 mb-2">
            {t('admin.analytics.period')}
          </label>
          <select
            value={period}
            onChange={(e) => {
              onPeriodChange(e.target.value);
              if (e.target.value !== 'custom') {
                onStartDateChange('');
                onEndDateChange('');
              }
            }}
            className="w-full px-4 py-2.5 border border-[#dcc090]/35 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090] transition-all bg-white"
          >
            <option value="day">{t('admin.analytics.today')}</option>
            <option value="week">{t('admin.analytics.last7Days')}</option>
            <option value="month">{t('admin.analytics.last30Days')}</option>
            <option value="year">{t('admin.analytics.lastYear')}</option>
            <option value="custom">{t('admin.analytics.customRange')}</option>
          </select>
        </div>
        {period === 'custom' && (
          <>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#414141]/75 mb-2">
                {t('admin.analytics.startDate')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#dcc090]/35 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090] transition-all bg-white"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-[#414141]/75 mb-2">
                {t('admin.analytics.endDate')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#dcc090]/35 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090] transition-all bg-white"
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}




