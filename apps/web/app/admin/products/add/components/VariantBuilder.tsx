'use client';

import type { ChangeEvent, RefObject } from 'react';
import { Button, Input } from '@shop/ui';
import { useTranslation } from '../../../../../lib/i18n-client';
import { CURRENCIES, type CurrencyCode } from '../../../../../lib/currency';
import type { GeneratedVariant } from '../types';

interface VariantBuilderProps {
  generatedVariants: GeneratedVariant[];
  isEditMode: boolean;
  hasVariantsToLoad: boolean;
  defaultCurrency: CurrencyCode;
  imageUploadLoading: boolean;
  slug: string;
  title: string;
  variantImageInputRefs: RefObject<Record<string, HTMLInputElement | null>>;
  onVariantUpdate: (updater: (prev: GeneratedVariant[]) => GeneratedVariant[]) => void;
  onVariantDelete: (variantId: string) => void;
  onVariantAdd: () => void;
  onApplyToAll: (field: 'price' | 'compareAtPrice' | 'stock' | 'sku', value: string) => void;
  onVariantImageUpload: (variantId: string, event: ChangeEvent<HTMLInputElement>) => void;
  generateSlug: (title: string) => string;
}

export function VariantBuilder({
  generatedVariants,
  isEditMode,
  hasVariantsToLoad,
  defaultCurrency,
  imageUploadLoading,
  slug,
  title,
  variantImageInputRefs,
  onVariantUpdate,
  onVariantDelete,
  onVariantAdd,
  onApplyToAll,
  onVariantImageUpload,
  generateSlug,
}: VariantBuilderProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.products.add.variantBuilder')}</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {generatedVariants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t('admin.products.add.noVariants') || 'No variants yet. Add one to start.'}</p>
            <Button type="button" variant="outline" onClick={onVariantAdd}>
              {t('admin.products.add.addVariant') || 'Add variant'}
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('admin.products.add.generatedVariants')} ({generatedVariants.length.toString()})
              </h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const price = prompt(t('admin.products.add.enterDefaultPrice'));
                    if (price !== null) onApplyToAll('price', price);
                  }}
                >
                  {t('admin.products.add.applyPriceToAll')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const stock = prompt(t('admin.products.add.enterDefaultStock'));
                    if (stock !== null) onApplyToAll('stock', stock);
                  }}
                >
                  {t('admin.products.add.applyStockToAll')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const skuPrefix = prompt(t('admin.products.add.enterSkuPrefix'));
                    if (skuPrefix !== null) {
                      const baseSlug = skuPrefix || slug || generateSlug(title) || 'PROD';
                      onVariantUpdate((prev) =>
                        prev.map((variant, index) => ({
                          ...variant,
                          sku: `${baseSlug.toUpperCase()}-${index + 1}`,
                        }))
                      );
                    }
                  }}
                >
                  {t('admin.products.add.applySkuToAll')}
                </Button>
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products.add.price')}
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products.add.compareAtPrice')}
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products.add.stock')}
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products.add.sku')}
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products.add.image')}
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      {t('admin.products.add.actions') || 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedVariants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-gray-50">
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={variant.price}
                            onChange={(e) => {
                              onVariantUpdate((prev) =>
                                prev.map((v) => (v.id === variant.id ? { ...v, price: e.target.value } : v))
                              );
                            }}
                            placeholder={t('admin.products.add.pricePlaceholder')}
                            className="w-20 text-xs"
                            min="0"
                            step="0.01"
                          />
                          <span className="text-xs text-gray-500">{CURRENCIES[defaultCurrency].symbol}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={variant.compareAtPrice}
                            onChange={(e) => {
                              onVariantUpdate((prev) =>
                                prev.map((v) => (v.id === variant.id ? { ...v, compareAtPrice: e.target.value } : v))
                              );
                            }}
                            placeholder={t('admin.products.add.pricePlaceholder')}
                            className="w-20 text-xs"
                            min="0"
                            step="0.01"
                          />
                          <span className="text-xs text-gray-500">{CURRENCIES[defaultCurrency].symbol}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => {
                            onVariantUpdate((prev) =>
                              prev.map((v) => (v.id === variant.id ? { ...v, stock: e.target.value } : v))
                            );
                          }}
                          placeholder={t('admin.products.add.quantityPlaceholder')}
                          className="w-16 text-xs"
                          min="0"
                        />
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <Input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => {
                            onVariantUpdate((prev) =>
                              prev.map((v) => (v.id === variant.id ? { ...v, sku: e.target.value } : v))
                            );
                          }}
                          placeholder={t('admin.products.add.autoGenerated')}
                          className="w-24 text-xs"
                        />
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {variant.image ? (
                            <div className="relative inline-block">
                              <img
                                src={variant.image}
                                alt="Variant"
                                className="w-12 h-12 object-cover border border-gray-300 rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  onVariantUpdate((prev) =>
                                    prev.map((v) => (v.id === variant.id ? { ...v, image: null } : v))
                                  );
                                  if (variantImageInputRefs.current?.[variant.id]) {
                                    variantImageInputRefs.current[variant.id]!.value = '';
                                  }
                                }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                                title={t('admin.products.add.removeImage')}
                              >
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => variantImageInputRefs.current?.[variant.id]?.click()}
                              disabled={imageUploadLoading}
                              className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              {imageUploadLoading ? t('admin.products.add.uploading') : t('admin.products.add.uploadImage')}
                            </button>
                          )}
                          <input
                            ref={(el) => {
                              if (variantImageInputRefs.current) {
                                variantImageInputRefs.current[variant.id] = el;
                              }
                            }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => onVariantImageUpload(variant.id, e)}
                            className="hidden"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onVariantDelete(variant.id)}
                          className="px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100"
                          title={t('admin.products.add.deleteVariant') || 'Delete variant'}
                        >
                          <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {t('admin.products.add.delete') || 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <Button type="button" variant="outline" onClick={onVariantAdd}>
                {t('admin.products.add.addVariant') || 'Add variant'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
