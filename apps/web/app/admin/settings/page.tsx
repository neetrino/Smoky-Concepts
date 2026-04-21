'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/AuthContext';
import { Card, Button } from '@shop/ui';
import { apiClient } from '../../../lib/api-client';
import { useTranslation } from '../../../lib/i18n-client';
interface Settings {
  defaultCurrency?: string;
  globalDiscount?: number;
  categoryDiscounts?: Record<string, number>;
  brandDiscounts?: Record<string, number>;
  currencyRates?: Record<string, number>;
}

const DEFAULT_CURRENCY_RATES: Record<string, number> = {
  AMD: 1,
  USD: 1 / 400,
  RUB: 0.2,
};

function normalizeCurrencyRates(rates?: Record<string, number>): Record<string, number> {
  const usd = Number(rates?.USD);
  const rub = Number(rates?.RUB);
  return {
    AMD: 1,
    USD: Number.isFinite(usd) && usd > 0 ? usd : DEFAULT_CURRENCY_RATES.USD,
    RUB: Number.isFinite(rub) && rub > 0 ? rub : DEFAULT_CURRENCY_RATES.RUB,
  };
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    defaultCurrency: 'AMD',
    currencyRates: DEFAULT_CURRENCY_RATES,
  });

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn || !isAdmin) {
        router.push('/admin');
        return;
      }
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchSettings();
    }
  }, [isLoggedIn, isAdmin]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('⚙️ [ADMIN] Fetching settings...');
      const data = await apiClient.get<Settings>('/api/v1/admin/settings');
      const normalizedRates = normalizeCurrencyRates(data.currencyRates);
      setSettings({
        defaultCurrency: data.defaultCurrency || 'AMD',
        globalDiscount: data.globalDiscount,
        categoryDiscounts: data.categoryDiscounts,
        brandDiscounts: data.brandDiscounts,
        currencyRates: normalizedRates,
      });
      console.log('✅ [ADMIN] Settings loaded:', data);
    } catch (err: any) {
      console.error('❌ [ADMIN] Error fetching settings:', err);
      setSettings({ defaultCurrency: 'AMD', currencyRates: DEFAULT_CURRENCY_RATES });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('⚙️ [ADMIN] Saving settings...', settings);

      const currencyRatesToSave = normalizeCurrencyRates(settings.currencyRates);
      const nextDefaultCurrency = settings.defaultCurrency || 'AMD';

      await apiClient.put('/api/v1/admin/settings', {
        defaultCurrency: nextDefaultCurrency,
        currencyRates: currencyRatesToSave,
      });

      alert(t('admin.settings.savedSuccess'));
      console.log('✅ [ADMIN] Settings saved, currency rates:', currencyRatesToSave);
    } catch (err: any) {
      console.error('❌ [ADMIN] Error saving settings:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save settings';
      alert(t('admin.settings.errorSaving').replace('{message}', errorMessage));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('admin.settings.backToAdmin')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.settings.title')}</h1>
        </div>

        {/* General Settings */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.settings.generalSettings')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.siteName')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={t('admin.settings.siteNamePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.siteDescription')}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                defaultValue={t('admin.settings.siteDescriptionPlaceholder')}
              />
            </div>
          </div>
        </Card>

        {/* Payment Settings */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.settings.paymentSettings')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.defaultCurrency')}
              </label>
              <select 
                value={settings.defaultCurrency || 'AMD'}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AMD">{t('admin.settings.amd')}</option>
                <option value="USD">{t('admin.settings.usd')}</option>
                <option value="RUB">{t('admin.settings.rub')}</option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">{t('admin.settings.enableOnlinePayments')}</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Currency Exchange Rates */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.settings.currencyRates')}</h2>
          <p className="mb-4 text-sm text-gray-600">{t('admin.settings.currencyRatesDescription')}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.baseCurrency')}
              </label>
              <input
                type="number"
                value={1}
                disabled
                className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.rateToUSD')}
              </label>
              <input
                type="number"
                min="0.000001"
                step="0.000001"
                value={settings.currencyRates?.USD ?? DEFAULT_CURRENCY_RATES.USD}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setSettings((prev) => ({
                    ...prev,
                    currencyRates: {
                      ...(prev.currencyRates || DEFAULT_CURRENCY_RATES),
                      USD: Number.isFinite(value) ? value : DEFAULT_CURRENCY_RATES.USD,
                    },
                  }));
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.rateToRub')}
              </label>
              <input
                type="number"
                min="0.000001"
                step="0.000001"
                value={settings.currencyRates?.RUB ?? DEFAULT_CURRENCY_RATES.RUB}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setSettings((prev) => ({
                    ...prev,
                    currencyRates: {
                      ...(prev.currencyRates || DEFAULT_CURRENCY_RATES),
                      RUB: Number.isFinite(value) ? value : DEFAULT_CURRENCY_RATES.RUB,
                    },
                  }));
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">{t('admin.settings.amdPrimaryNote')}</p>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t('admin.settings.saving') : t('admin.settings.saveSettings')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            disabled={saving}
          >
            {t('admin.settings.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}

