'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input } from '@shop/ui';

import { apiClient } from '@/lib/api-client';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { useTranslation } from '@/lib/i18n-client';
import { showToast } from '@/components/Toast';

import { initialSizeItemModal, SizeItemModal, type SizeItemModalState } from './SizeItemModal';

const ADMIN_LIST_ENDPOINT = '/api/v1/admin/size-catalog/categories';

export function SizeCatalogAdmin() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<SizeCatalogCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryTitle, setEditingCategoryTitle] = useState('');
  const [itemModal, setItemModal] = useState<SizeItemModalState>(initialSizeItemModal);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: SizeCatalogCategoryDto[] }>(ADMIN_LIST_ENDPOINT);
      setCategories(res.data ?? []);
    } catch {
      showToast(t('admin.sizes.errorLoad'), 'error');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const handleAddCategory = async () => {
    const title = newCategoryTitle.trim();
    if (!title) {
      showToast(t('admin.sizes.titleRequired'), 'warning');
      return;
    }
    setSavingCategory(true);
    try {
      await apiClient.post(ADMIN_LIST_ENDPOINT, { title });
      setNewCategoryTitle('');
      showToast(t('admin.sizes.categoryCreated'), 'success');
      await fetchCatalog();
    } catch {
      showToast(t('admin.sizes.errorSave'), 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const startEditCategory = (cat: SizeCatalogCategoryDto) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryTitle(cat.title);
  };

  const saveEditCategory = async () => {
    if (!editingCategoryId) {
      return;
    }
    const title = editingCategoryTitle.trim();
    if (!title) {
      showToast(t('admin.sizes.titleRequired'), 'warning');
      return;
    }
    try {
      await apiClient.patch(`/api/v1/admin/size-catalog/categories/${editingCategoryId}`, { title });
      setEditingCategoryId(null);
      showToast(t('admin.sizes.categoryUpdated'), 'success');
      await fetchCatalog();
    } catch {
      showToast(t('admin.sizes.errorSave'), 'error');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm(t('admin.sizes.deleteCategoryConfirm'))) {
      return;
    }
    try {
      await apiClient.delete(`/api/v1/admin/size-catalog/categories/${id}`);
      showToast(t('admin.sizes.categoryDeleted'), 'success');
      await fetchCatalog();
    } catch {
      showToast(t('admin.sizes.errorDelete'), 'error');
    }
  };

  const openItemModal = (categoryId: string, mode: 'create' | 'edit', item?: SizeCatalogItemDto) => {
    setItemModal({
      open: true,
      categoryId,
      mode,
      itemId: item?.id ?? null,
      title: item?.title ?? '',
      imageUrl: item?.imageUrl ?? '',
    });
  };

  const openDuplicateModal = (categoryId: string, item: SizeCatalogItemDto) => {
    setItemModal({
      open: true,
      categoryId,
      mode: 'duplicate',
      itemId: null,
      title: item.title,
      imageUrl: item.imageUrl,
    });
  };

  const publishDraftItem = async (itemId: string) => {
    try {
      await apiClient.patch(`/api/v1/admin/size-catalog/items/${itemId}`, { published: true });
      showToast(t('admin.sizes.itemPublished'), 'success');
      await fetchCatalog();
    } catch {
      showToast(t('admin.sizes.errorSave'), 'error');
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!window.confirm(t('admin.sizes.deleteItemConfirm'))) {
      return;
    }
    try {
      await apiClient.delete(`/api/v1/admin/size-catalog/items/${itemId}`);
      showToast(t('admin.sizes.itemDeleted'), 'success');
      await fetchCatalog();
    } catch {
      showToast(t('admin.sizes.errorDelete'), 'error');
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-600">{t('admin.sizes.loading')}</p>;
  }

  return (
    <div className="space-y-8">
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900">{t('admin.sizes.newCategorySection')}</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('admin.sizes.categoryTitle')}</label>
            <Input
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
              placeholder={t('admin.sizes.categoryTitlePlaceholder')}
              disabled={savingCategory}
            />
          </div>
          <Button type="button" variant="primary" onClick={() => void handleAddCategory()} disabled={savingCategory}>
            {savingCategory ? t('admin.sizes.saving') : t('admin.sizes.createCategory')}
          </Button>
        </div>
      </Card>

      {categories.length === 0 ? (
        <p className="text-sm text-gray-600">{t('admin.sizes.noCategories')}</p>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  {editingCategoryId === cat.id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        value={editingCategoryTitle}
                        onChange={(e) => setEditingCategoryTitle(e.target.value)}
                        className="max-w-md"
                      />
                      <Button type="button" variant="primary" size="sm" onClick={() => void saveEditCategory()}>
                        {t('admin.sizes.save')}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingCategoryId(null);
                        }}
                      >
                        {t('admin.sizes.cancel')}
                      </Button>
                    </div>
                  ) : (
                    <h3 className="text-xl font-semibold text-gray-900">{cat.title}</h3>
                  )}
                </div>
                {editingCategoryId !== cat.id && (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => startEditCategory(cat)}>
                      {t('admin.sizes.renameCategory')}
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => openItemModal(cat.id, 'create')}>
                      {t('admin.sizes.addItem')}
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => void deleteCategory(cat.id)}>
                      {t('admin.sizes.deleteCategory')}
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.items.length === 0 ? (
                  <p className="text-sm text-gray-500">{t('admin.sizes.noItems')}</p>
                ) : (
                  cat.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex gap-3 rounded-lg border bg-white p-3 shadow-sm ${
                        item.published ? 'border-gray-200' : 'border-amber-300 bg-amber-50/40'
                      }`}
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <img src={item.imageUrl} alt="" className="h-full w-full object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          {!item.published ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                              {t('admin.sizes.draftLabel')}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => openItemModal(cat.id, 'edit', item)}
                          >
                            {t('admin.sizes.editItem')}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            title={t('admin.sizes.duplicateItem')}
                            aria-label={t('admin.sizes.duplicateItem')}
                            onClick={() => openDuplicateModal(cat.id, item)}
                            className="px-2"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                              <rect x="7" y="7" width="12" height="12" rx="2" strokeWidth={2} />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15H4a1 1 0 01-1-1V5a1 1 0 011-1h9a1 1 0 011 1v1"
                              />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10v6M10 13h6" />
                            </svg>
                          </Button>
                          {!item.published ? (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() => void publishDraftItem(item.id)}
                            >
                              {t('admin.sizes.activateItem')}
                            </Button>
                          ) : null}
                          <Button type="button" variant="secondary" size="sm" onClick={() => void deleteItem(item.id)}>
                            {t('admin.sizes.deleteItem')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <SizeItemModal
        modal={itemModal}
        onClose={() => setItemModal(initialSizeItemModal)}
        onSaved={fetchCatalog}
      />
    </div>
  );
}
