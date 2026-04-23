'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import type { Category, CategoryFormData } from '../types';
import { CategoryImageField } from './CategoryImageField';

interface EditCategoryModalProps {
  isOpen: boolean;
  editingCategory: Category | null;
  formData: CategoryFormData;
  categories: Category[];
  saving: boolean;
  onClose: () => void;
  onFormDataChange: (data: CategoryFormData) => void;
  onSubmit: () => Promise<void>;
}

export function EditCategoryModal({
  isOpen,
  editingCategory,
  formData,
  categories,
  saving,
  onClose,
  onFormDataChange,
  onSubmit,
}: EditCategoryModalProps) {
  const { t } = useTranslation();

  if (!isOpen || !editingCategory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 overflow-hidden rounded-2xl border border-[#dcc090]/30 bg-white shadow-[0_24px_60px_rgba(18,42,38,0.18)] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#dcc090]/20 bg-[#122a26] px-6 py-4">
          <h3 className="text-base font-black uppercase tracking-[0.1em] text-[#dcc090]">
            {t('admin.categories.editCategory')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#dcc090]/60 transition-colors hover:bg-white/10 hover:text-[#dcc090]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
              {t('admin.categories.categoryTitle')} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
              placeholder={t('admin.categories.categoryTitlePlaceholder')}
              className="w-full rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2.5 text-sm text-[#122a26] placeholder-[#414141]/30 outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
              {t('admin.categories.parentCategory')}
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => onFormDataChange({ ...formData, parentId: e.target.value })}
              className="w-full rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2.5 text-sm text-[#122a26] outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
            >
              <option value="">{t('admin.categories.rootCategory')}</option>
              {categories
                .filter((cat) => cat.id !== editingCategory.id && !cat.parentId)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.title}</option>
                ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={formData.requiresSizes}
              onChange={(e) => onFormDataChange({ ...formData, requiresSizes: e.target.checked })}
              className="h-4 w-4 rounded border-[#dcc090]/40 text-[#122a26] focus:ring-[#dcc090]"
            />
            <span className="text-sm text-[#414141]/75">{t('admin.categories.requiresSizes')}</span>
          </label>

          <CategoryImageField
            value={formData.imageUrl}
            onChange={(imageUrl) => onFormDataChange({ ...formData, imageUrl })}
            disabled={saving}
          />

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
              Subcategories
            </label>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-[#dcc090]/25 bg-[#dcc090]/5 p-2 space-y-1">
              {categories.filter((cat) => cat.id !== editingCategory.id).length === 0 ? (
                <p className="px-2 py-1 text-sm text-[#414141]/45">No available categories</p>
              ) : (
                categories
                  .filter((cat) => cat.id !== editingCategory.id)
                  .map((cat) => {
                    const isChecked = formData.subcategoryIds.includes(cat.id);
                    return (
                      <label key={cat.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-[#dcc090]/15">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            onFormDataChange({
                              ...formData,
                              subcategoryIds: e.target.checked
                                ? [...formData.subcategoryIds, cat.id]
                                : formData.subcategoryIds.filter((id) => id !== cat.id),
                            });
                          }}
                          className="h-4 w-4 rounded border-[#dcc090]/40 text-[#122a26] focus:ring-[#dcc090]"
                        />
                        <span className="text-sm text-[#414141]/75">{cat.title}</span>
                      </label>
                    );
                  })
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-[#dcc090]/20 px-6 py-4">
          <button
            type="button"
            onClick={() => void onSubmit()}
            disabled={saving || !formData.title.trim()}
            className="flex-1 rounded-lg bg-[#122a26] py-2.5 text-sm font-bold text-[#dcc090] shadow-[0_4px_14px_rgba(18,42,38,0.18)] transition-all hover:bg-[#18352f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? t('admin.categories.updating') : t('admin.categories.updateCategory')}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-[#dcc090]/30 px-5 py-2.5 text-sm font-bold text-[#414141]/70 transition-all hover:border-[#dcc090]/50 hover:bg-[#dcc090]/10 disabled:opacity-50"
          >
            {t('admin.common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
