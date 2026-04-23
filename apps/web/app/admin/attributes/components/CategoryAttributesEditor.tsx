'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../../../../lib/api-client';
import { useTranslation } from '../../../../lib/i18n-client';
import { showToast } from '../../../../components/Toast';
import { AttributeValueEditModal } from '../../../../components/AttributeValueEditModal';
import type { CategoryAttribute } from '@/lib/category-attributes';

export function CategoryAttributesEditor() {
  const { t } = useTranslation();
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingAttribute, setCreatingAttribute] = useState(false);
  const [newAttributeTitle, setNewAttributeTitle] = useState('');
  const [newValueByAttributeId, setNewValueByAttributeId] = useState<Record<string, string>>({});
  const [expandedAttributeIds, setExpandedAttributeIds] = useState<Set<string>>(new Set());
  const [editingValue, setEditingValue] = useState<{
    attributeId: string;
    value: CategoryAttribute['values'][number];
  } | null>(null);

  const toggleExpanded = (attributeId: string) => {
    setExpandedAttributeIds((prev) => {
      const next = new Set(prev);
      if (next.has(attributeId)) { next.delete(attributeId); } else { next.add(attributeId); }
      return next;
    });
  };

  useEffect(() => {
    const loadAttributes = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ data: CategoryAttribute[] }>(`/api/v1/admin/attributes`);
        setAttributes(response.data || []);
      } catch {
        showToast(t('admin.attributes.errorCreating').replace('{message}', 'Failed to load attributes'), 'error');
      } finally {
        setLoading(false);
      }
    };
    void loadAttributes();
  }, [t]);

  const handleCreateAttribute = async () => {
    if (!newAttributeTitle.trim()) return;
    try {
      setCreatingAttribute(true);
      const response = await apiClient.post<{ data: CategoryAttribute }>(`/api/v1/admin/attributes`, {
        title: newAttributeTitle.trim(),
      });
      setAttributes((prev) => [...prev, response.data]);
      setNewAttributeTitle('');
      showToast(t('admin.attributes.createdSuccess'), 'success');
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: string }).message) : 'Failed to create attribute';
      showToast(t('admin.attributes.errorCreating').replace('{message}', message), 'error');
    } finally {
      setCreatingAttribute(false);
    }
  };

  const handleEditAttribute = async (attribute: CategoryAttribute) => {
    const nextTitle = prompt(t('admin.attributes.editAttribute'), attribute.title);
    if (nextTitle === null || !nextTitle.trim()) return;
    try {
      const response = await apiClient.put<{ data: CategoryAttribute }>(
        `/api/v1/admin/attributes/${attribute.id}`,
        { title: nextTitle.trim() }
      );
      setAttributes((prev) => prev.map((item) => (item.id === attribute.id ? response.data : item)));
      showToast(t('admin.attributes.nameUpdatedSuccess'), 'success');
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: string }).message) : 'Failed to update attribute';
      showToast(t('admin.attributes.errorCreating').replace('{message}', message), 'error');
    }
  };

  const handleDeleteAttribute = async (attribute: CategoryAttribute) => {
    if (!confirm(t('admin.attributes.deleteConfirm').replace('{name}', attribute.title))) return;
    try {
      await apiClient.delete(`/api/v1/admin/attributes/${attribute.id}`);
      setAttributes((prev) => prev.filter((item) => item.id !== attribute.id));
      showToast(t('admin.attributes.deletedSuccess'), 'success');
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: string }).message) : 'Failed to delete attribute';
      showToast(t('admin.attributes.errorDeleting').replace('{message}', message), 'error');
    }
  };

  const handleCreateValue = async (attribute: CategoryAttribute) => {
    const label = newValueByAttributeId[attribute.id]?.trim();
    if (!label) return;
    try {
      const response = await apiClient.post<{ data: CategoryAttribute }>(
        `/api/v1/admin/attributes/${attribute.id}/values`,
        { label }
      );
      setAttributes((prev) => prev.map((item) => (item.id === attribute.id ? response.data : item)));
      setNewValueByAttributeId((prev) => ({ ...prev, [attribute.id]: '' }));
      showToast(t('admin.attributes.valueAddedSuccess'), 'success');
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: string }).message) : 'Failed to create value';
      showToast(t('admin.attributes.errorAddingValue').replace('{message}', message), 'error');
    }
  };

  const handleDeleteValue = async (attributeId: string, valueId: string, label: string) => {
    if (!confirm(t('admin.attributes.deleteValueConfirm').replace('{label}', label))) return;
    try {
      await apiClient.delete(`/api/v1/admin/attributes/${attributeId}/values/${valueId}`);
      setAttributes((prev) =>
        prev.map((item) =>
          item.id === attributeId
            ? { ...item, values: item.values.filter((value) => value.id !== valueId) }
            : item
        )
      );
      showToast(t('admin.attributes.valueDeletedSuccess'), 'success');
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: string }).message) : 'Failed to delete value';
      showToast(t('admin.attributes.errorDeletingValue').replace('{message}', message), 'error');
    }
  };

  const handleSaveValue = async (data: { label?: string; colors?: string[]; imageUrl?: string | null }) => {
    if (!editingValue) return;
    const response = await apiClient.put<{ data: CategoryAttribute }>(
      `/api/v1/admin/attributes/${editingValue.attributeId}/values/${editingValue.value.id}`,
      data
    );
    setAttributes((prev) =>
      prev.map((item) => (item.id === editingValue.attributeId ? response.data : item))
    );
    showToast(t('admin.attributes.valueUpdatedSuccess'), 'success');
  };

  return (
    <>
      <div className="space-y-5">
        {/* New attribute input */}
        <div className="flex flex-col gap-3 rounded-xl border border-[#dcc090]/25 bg-[#dcc090]/8 p-4 sm:flex-row">
          <input
            value={newAttributeTitle}
            onChange={(e) => setNewAttributeTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleCreateAttribute(); }}
            placeholder={t('admin.attributes.namePlaceholder')}
            className="flex-1 rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2.5 text-sm text-[#122a26] placeholder-[#414141]/30 outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
          />
          <button
            type="button"
            onClick={() => void handleCreateAttribute()}
            disabled={creatingAttribute || !newAttributeTitle.trim()}
            className="rounded-lg bg-[#122a26] px-5 py-2.5 text-sm font-bold text-[#dcc090] shadow-[0_4px_14px_rgba(18,42,38,0.15)] transition-all hover:bg-[#18352f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creatingAttribute ? t('admin.attributes.adding') : t('admin.attributes.addAttribute')}
          </button>
        </div>

        {/* States */}
        {loading ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-b-2 border-[#122a26]" />
            <p className="text-sm text-[#414141]/55">{t('admin.attributes.loadingAttributes')}</p>
          </div>
        ) : attributes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#dcc090]/40 p-10 text-center">
            <p className="text-sm text-[#414141]/50">{t('admin.attributes.noAttributes')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attributes.map((attribute) => {
              const isExpanded = expandedAttributeIds.has(attribute.id);
              return (
                <div
                  key={attribute.id}
                  className="overflow-hidden rounded-xl border border-[#dcc090]/25 bg-white/95 transition-all duration-200 hover:border-[#dcc090]/50 hover:shadow-[0_4px_16px_rgba(18,42,38,0.06)]"
                >
                  {/* Attribute header row */}
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    onClick={() => toggleExpanded(attribute.id)}
                  >
                    <div>
                      <h4 className="text-sm font-black text-[#122a26]">{attribute.title}</h4>
                      <p className="mt-0.5 text-xs uppercase tracking-[0.08em] text-[#414141]/45">{attribute.key}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[#dcc090]/20 px-2.5 py-0.5 text-xs font-bold text-[#122a26]">
                        {attribute.values.length} {t('admin.attributes.valuesCount') ?? 'values'}
                      </span>
                      <svg
                        className={`h-4 w-4 text-[#414141]/40 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#dcc090]/20 px-5 pb-5 pt-4 space-y-4">
                      {/* Edit / Delete attribute */}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void handleEditAttribute(attribute)}
                          className="rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 px-3 py-1.5 text-xs font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090]"
                        >
                          {t('admin.common.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteAttribute(attribute)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 hover:border-red-300"
                        >
                          {t('admin.common.delete')}
                        </button>
                      </div>

                      {/* Add new value */}
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          value={newValueByAttributeId[attribute.id] || ''}
                          onChange={(e) =>
                            setNewValueByAttributeId((prev) => ({ ...prev, [attribute.id]: e.target.value }))
                          }
                          onKeyDown={(e) => { if (e.key === 'Enter') void handleCreateValue(attribute); }}
                          placeholder={t('admin.attributes.addNewValue')}
                          className="flex-1 rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2 text-sm text-[#122a26] placeholder-[#414141]/30 outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
                        />
                        <button
                          type="button"
                          onClick={() => void handleCreateValue(attribute)}
                          className="rounded-lg border border-[#dcc090]/40 bg-[#dcc090]/15 px-4 py-2 text-xs font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090]"
                        >
                          {t('admin.attributes.add')}
                        </button>
                      </div>

                      {/* Values list */}
                      <div className="space-y-2">
                        {attribute.values.length === 0 ? (
                          <p className="text-sm text-[#414141]/45">{t('admin.attributes.noValuesYet')}</p>
                        ) : (
                          attribute.values.map((value) => (
                            <div
                              key={value.id}
                              className="flex flex-col gap-3 rounded-xl border border-[#dcc090]/20 bg-[#dcc090]/5 p-3 lg:flex-row lg:items-center lg:justify-between"
                            >
                              <div className="flex items-center gap-3">
                                {value.imageUrl ? (
                                  <img
                                    src={value.imageUrl}
                                    alt={value.label}
                                    className="h-12 w-12 rounded-lg border border-[#dcc090]/30 bg-white object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-[#dcc090]/35 bg-white text-[10px] font-bold text-[#414141]/30">
                                    IMG
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-bold text-[#122a26]">{value.label}</p>
                                  {value.colors.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                      {value.colors.map((color) => (
                                        <span
                                          key={color}
                                          className="h-4 w-4 rounded-full border border-[#dcc090]/40 shadow-sm"
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingValue({ attributeId: attribute.id, value })}
                                  className="rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 px-3 py-1.5 text-xs font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090]"
                                >
                                  {t('admin.attributes.configureValue')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteValue(attribute.id, value.id, value.label)}
                                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 hover:border-red-300"
                                >
                                  {t('admin.common.delete')}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingValue ? (
        <AttributeValueEditModal
          isOpen
          onClose={() => setEditingValue(null)}
          value={editingValue.value}
          attributeId={editingValue.attributeId}
          onSave={handleSaveValue}
        />
      ) : null}
    </>
  );
}
