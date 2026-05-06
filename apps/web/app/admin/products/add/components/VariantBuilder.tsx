'use client';

import { useState, type ChangeEvent, type RefObject } from 'react';
import { Button, Input } from '@shop/ui';
import { useTranslation } from '../../../../../lib/i18n-client';
import { ADMIN_PRODUCT_INPUT_CURRENCY, CURRENCIES } from '../../../../../lib/currency';
import type { GeneratedVariant } from '../types';
import type { CategoryAttribute } from '@/lib/category-attributes';
import { ADMIN_RASTER_IMAGE_FILE_ACCEPT } from '@/lib/services/utils/heic-browser-convert';
import { VariantRowAttributeSelectors } from './VariantRowAttributeSelectors';
import {
  isDuplicateVariantCombination,
  mergeVariantAttributeValues,
  removeAttributeValuesFromVariant,
} from '../utils/variantAttributeHelpers';
import { SHOW_COMPARE_AT_PRICE_FIELD } from '../constants/compareAtPriceVisibility.constants';

const SIZE_ATTRIBUTE_KEY = 'size';
const SIZE_VERSION_ATTRIBUTE_KEY = 'size_version';
const SIZE_COLLECTION_ID_PREFIX = 'size-catalog-collection:';
const SIZE_VERSION_ID_PREFIX = 'size-catalog-version:';

function parseCollectionTokenFromSizeValueId(valueId: string): string | null {
  if (!valueId.startsWith(SIZE_COLLECTION_ID_PREFIX)) {
    return null;
  }
  return valueId.slice(SIZE_COLLECTION_ID_PREFIX.length) || null;
}

function parseCollectionTokenFromVersionValueId(valueId: string): string | null {
  if (!valueId.startsWith(SIZE_VERSION_ID_PREFIX)) {
    return null;
  }
  const payload = valueId.slice(SIZE_VERSION_ID_PREFIX.length);
  const separatorIdx = payload.indexOf(':');
  if (separatorIdx === -1) {
    return null;
  }
  return payload.slice(0, separatorIdx) || null;
}

interface VariantBuilderProps {
  generatedVariants: GeneratedVariant[];
  categoryAttributes: CategoryAttribute[];
  selectedAttributeValueIds: Record<string, string[]>;
  enabledAttributeIds: Record<string, boolean>;
  onEnabledAttributeIdsChange: (next: Record<string, boolean>) => void;
  isEditMode: boolean;
  hasVariantsToLoad: boolean;
  imageUploadLoading: boolean;
  slug: string;
  title: string;
  variantImageInputRefs: RefObject<Record<string, HTMLInputElement | null>>;
  onVariantUpdate: (updater: (prev: GeneratedVariant[]) => GeneratedVariant[]) => void;
  onVariantAdd: () => void;
  onSelectedAttributeValueIdsChange: (value: Record<string, string[]>) => void;
  onApplyToAll: (field: 'price' | 'compareAtPrice' | 'stock' | 'sku', value: string) => void;
  onVariantImageUpload: (variantId: string, event: ChangeEvent<HTMLInputElement>) => void;
  generateSlug: (title: string) => string;
}

export function VariantBuilder({
  generatedVariants,
  categoryAttributes,
  selectedAttributeValueIds,
  enabledAttributeIds,
  onEnabledAttributeIdsChange,
  isEditMode,
  hasVariantsToLoad,
  imageUploadLoading,
  slug,
  title,
  variantImageInputRefs,
  onVariantUpdate,
  onVariantAdd,
  onSelectedAttributeValueIdsChange,
  onApplyToAll,
  onVariantImageUpload,
  generateSlug,
}: VariantBuilderProps) {
  const { t } = useTranslation();
  const [isAttributeSelectionSectionOpen, setIsAttributeSelectionSectionOpen] = useState(false);
  const [attributeCombinationError, setAttributeCombinationError] = useState<string | null>(null);
  const hasAttributeDrivenVariants = categoryAttributes.length > 0;
  const sizeAttribute = categoryAttributes.find((attribute) => attribute.key === SIZE_ATTRIBUTE_KEY);
  const sizeVersionAttribute = categoryAttributes.find(
    (attribute) => attribute.key === SIZE_VERSION_ATTRIBUTE_KEY
  );
  const isSizeEnabled = sizeAttribute ? enabledAttributeIds[sizeAttribute.id] === true : false;
  const attributeToggles = categoryAttributes.filter(
    (attribute) => attribute.key !== SIZE_VERSION_ATTRIBUTE_KEY
  );
  const attributesInUse = categoryAttributes.filter((attribute) => {
    if (attribute.key === SIZE_VERSION_ATTRIBUTE_KEY) {
      return isSizeEnabled;
    }
    return enabledAttributeIds[attribute.id] === true;
  });

  const enforceSizeVersionCompatibility = (selectedValueIds: string[]): string[] => {
    if (!sizeVersionAttribute) {
      return selectedValueIds;
    }
    const sizeVersionValueIdSet = new Set(sizeVersionAttribute.values.map((value) => value.id));
    const selectedCollectionTokens = selectedValueIds
      .map((valueId) => parseCollectionTokenFromSizeValueId(valueId))
      .filter((token): token is string => Boolean(token));

    if (selectedCollectionTokens.length === 0) {
      return selectedValueIds.filter((valueId) => !sizeVersionValueIdSet.has(valueId));
    }

    const selectedCollectionTokenSet = new Set(selectedCollectionTokens);
    return selectedValueIds.filter((valueId) => {
      if (!sizeVersionValueIdSet.has(valueId)) {
        return true;
      }
      const token = parseCollectionTokenFromVersionValueId(valueId);
      return token !== null && selectedCollectionTokenSet.has(token);
    });
  };

  const handleToggleAttributeEnabled = (attributeId: string, checked: boolean) => {
    setAttributeCombinationError(null);
    const nextEnabledAttributeIds = {
      ...enabledAttributeIds,
      [attributeId]: checked,
    };

    if (sizeAttribute && attributeId === sizeAttribute.id) {
      nextEnabledAttributeIds[sizeAttribute.id] = checked;
      if (sizeVersionAttribute) {
        nextEnabledAttributeIds[sizeVersionAttribute.id] = checked;
      }
    }
    onEnabledAttributeIdsChange(nextEnabledAttributeIds);

    if (!checked) {
      const attribute = categoryAttributes.find((a) => a.id === attributeId);
      const nextPool = { ...selectedAttributeValueIds };
      delete nextPool[attributeId];
      if (sizeAttribute && sizeVersionAttribute && attributeId === sizeAttribute.id) {
        delete nextPool[sizeVersionAttribute.id];
      }
      onSelectedAttributeValueIdsChange(nextPool);
      if (attribute || (sizeAttribute && sizeVersionAttribute && attributeId === sizeAttribute.id)) {
        onVariantUpdate((prev) =>
          prev.map((v) => ({
            ...v,
            selectedValueIds: enforceSizeVersionCompatibility(
              attribute ? removeAttributeValuesFromVariant(v, attribute) : v.selectedValueIds
            ),
          }))
        );
      }
    }
  };

  const handleVariantAttributeValuesChange = (variantId: string, attributeId: string, valueIds: string[]) => {
    const attribute = categoryAttributes.find((a) => a.id === attributeId);
    if (!attribute) {
      return;
    }
    const variant = generatedVariants.find((v) => v.id === variantId);
    if (!variant) {
      return;
    }

    const nextIds = enforceSizeVersionCompatibility(
      mergeVariantAttributeValues(variant, attribute, valueIds)
    );

    if (nextIds.length > 0 && isDuplicateVariantCombination(nextIds, generatedVariants, variantId)) {
      setAttributeCombinationError(t('admin.products.add.duplicateVariantCombination'));
      return;
    }

    setAttributeCombinationError(null);
    onVariantUpdate((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, selectedValueIds: nextIds } : v))
    );
  };

  const getVariantOptionLabel = (variant: GeneratedVariant) => {
    return categoryAttributes
      .filter((attribute) => enabledAttributeIds[attribute.id] === true)
      .map((attribute) => {
        const labels = attribute.values
          .filter((value) => variant.selectedValueIds.includes(value.id))
          .map((value) => value.label);

        if (labels.length === 0) {
          return null;
        }

        return `${attribute.title}: ${labels.join(', ')}`;
      })
      .filter((label): label is string => Boolean(label))
      .join(' / ');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.products.add.variantBuilder')}</h2>
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {hasAttributeDrivenVariants ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={() => setIsAttributeSelectionSectionOpen((open) => !open)}
              aria-expanded={isAttributeSelectionSectionOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100/80"
            >
              <span className="text-base font-semibold text-gray-900">
                {t('admin.products.add.selectAttributesSectionTitle')}
              </span>
              <svg
                className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${isAttributeSelectionSectionOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isAttributeSelectionSectionOpen ? (
              <div className="space-y-4 border-t border-gray-200 p-4">
                <div>
                  <p className="text-sm text-gray-500">{t('admin.products.add.selectAttributesDescription')}</p>
                </div>

                <div className="space-y-3">
                  {attributeToggles.map((attribute) => {
                    const enabled = enabledAttributeIds[attribute.id] === true;
                    return (
                      <div key={attribute.id} className="rounded-lg border border-gray-200 bg-white p-3">
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => handleToggleAttributeEnabled(attribute.id, e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-[#dcc090]/40 text-[#122a26] focus:ring-[#dcc090]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900">{attribute.title}</p>
                            <p className="text-xs uppercase tracking-wide text-gray-400">{attribute.key}</p>
                            {enabled ? (
                              <p className="mt-1 text-xs text-gray-500">
                                {t('admin.products.add.attributeValuesPickInTableHint')}
                              </p>
                            ) : null}
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {generatedVariants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t('admin.products.add.noVariants') || 'No variants yet. Add one to start.'}</p>
            <Button type="button" variant="outline" onClick={onVariantAdd}>
              {t('admin.products.add.addVariant') || 'Add variant'}
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('admin.products.add.generatedVariants')} ({generatedVariants.length.toString()})
              </h3>
              <div className="flex flex-wrap gap-2">
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

            {attributeCombinationError ? (
              <p className="mb-2 text-sm text-red-600" role="alert">
                {attributeCombinationError}
              </p>
            ) : null}
            <div className="border border-gray-300 rounded-lg overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products.add.attributes')}
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products.add.price')}
                    </th>
                    {SHOW_COMPARE_AT_PRICE_FIELD ? (
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.products.add.compareAtPrice')}
                      </th>
                    ) : null}
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products.add.stock')}
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products.add.sku')}
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products.add.image')}
                    </th>
                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.products.add.deleteVariant')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedVariants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-gray-50">
                      <td className="px-2 py-2 align-top">
                        {hasAttributeDrivenVariants ? (
                          attributesInUse.length > 0 ? (
                          <VariantRowAttributeSelectors
                            variant={variant}
                            categoryAttributes={attributesInUse}
                            onAttributeValuesChange={(attributeId, valueIds) =>
                              handleVariantAttributeValuesChange(variant.id, attributeId, valueIds)
                            }
                            labels={{
                              allBadge: t('admin.products.add.allValuesBadge'),
                              selectAll: t('admin.products.add.selectAllAttributeValues'),
                              done: t('admin.products.add.selectValuesDone'),
                              cancel: t('admin.products.add.selectValuesCancel'),
                            }}
                          />
                          ) : (
                            <p className="max-w-[200px] text-xs text-amber-700">
                              {t('admin.products.add.enableAttributesFirst')}
                            </p>
                          )
                        ) : (
                          <div className="min-w-[220px] text-xs text-gray-700">
                            {getVariantOptionLabel(variant) || t('admin.products.add.defaultColor')}
                          </div>
                        )}
                      </td>
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
                          <span className="text-xs text-gray-500">{CURRENCIES[ADMIN_PRODUCT_INPUT_CURRENCY].symbol}</span>
                        </div>
                      </td>
                      {SHOW_COMPARE_AT_PRICE_FIELD ? (
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
                            <span className="text-xs text-gray-500">{CURRENCIES[ADMIN_PRODUCT_INPUT_CURRENCY].symbol}</span>
                          </div>
                        </td>
                      ) : null}
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
                            accept={ADMIN_RASTER_IMAGE_FILE_ACCEPT}
                            onChange={(e) => onVariantImageUpload(variant.id, e)}
                            className="hidden"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-right align-middle">
                        <button
                          type="button"
                          onClick={() => {
                            onVariantUpdate((prev) => prev.filter((v) => v.id !== variant.id));
                            if (variantImageInputRefs.current) {
                              delete variantImageInputRefs.current[variant.id];
                            }
                          }}
                          className="inline-flex items-center justify-center rounded-md border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50"
                          title={t('admin.products.add.deleteVariant')}
                          aria-label={t('admin.products.add.deleteVariant')}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
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
