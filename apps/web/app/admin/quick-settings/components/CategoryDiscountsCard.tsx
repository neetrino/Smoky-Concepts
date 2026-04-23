'use client';

import { useTranslation } from '../../../../lib/i18n-client';

interface AdminCategory {
  id: string;
  title: string;
  parentId: string | null;
}

interface CategoryDiscountsCardProps {
  categories: AdminCategory[];
  categoriesLoading: boolean;
  categoryDiscounts: Record<string, number>;
  updateCategoryDiscountValue: (categoryId: string, value: string) => void;
  clearCategoryDiscount: (categoryId: string) => void;
  handleCategoryDiscountSave: () => void;
  categorySaving: boolean;
}

export function CategoryDiscountsCard({
  categories,
  categoriesLoading,
  categoryDiscounts,
  updateCategoryDiscountValue,
  clearCategoryDiscount,
  handleCategoryDiscountSave,
  categorySaving,
}: CategoryDiscountsCardProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dcc090]/30 bg-white/90 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
      <div className="flex items-center justify-between border-b border-[#dcc090]/20 bg-[#122a26] px-6 py-4">
        <div>
          <h2 className="text-base font-black uppercase tracking-[0.1em] text-[#dcc090]">
            {t('admin.quickSettings.categoryDiscounts')}
          </h2>
          <p className="mt-0.5 text-xs text-[#dcc090]/55">
            {t('admin.quickSettings.categoryDiscountsSubtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCategoryDiscountSave}
          disabled={categorySaving || categories.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-[#dcc090] px-5 py-2 text-sm font-bold text-[#122a26] shadow-[0_4px_14px_rgba(18,42,38,0.18)] transition-all hover:bg-[#e8d0a0] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {categorySaving ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-b-2 border-[#122a26]" />
              {t('admin.quickSettings.saving')}
            </>
          ) : (
            t('admin.quickSettings.save')
          )}
        </button>
      </div>

      <div className="p-5">
        {categoriesLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#122a26] mb-4" />
            <p className="text-sm text-[#414141]/70">{t('admin.quickSettings.loadingCategories')}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#414141]/70 border border-dashed border-[#dcc090]/35 rounded-xl">
            {t('admin.quickSettings.noCategories')}
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto divide-y divide-[#dcc090]/20 rounded-xl border border-[#dcc090]/25">
            {categories.map((category) => {
              const currentValue = categoryDiscounts[category.id];
              return (
                <div
                  key={category.id}
                  className="flex items-center gap-4 bg-white px-4 py-3 transition-colors hover:bg-[#dcc090]/10"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#122a26] truncate">
                      {category.title || t('admin.quickSettings.untitledCategory')}
                    </p>
                    <p className="text-xs text-[#414141]/55">
                      {category.parentId
                        ? t('admin.quickSettings.parentCategoryId').replace('{id}', category.parentId)
                        : t('admin.quickSettings.rootCategory')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={currentValue === undefined ? '' : currentValue}
                      onChange={(e) => updateCategoryDiscountValue(category.id, e.target.value)}
                      placeholder="0"
                      className="w-24 rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2 text-sm text-[#122a26] placeholder-[#414141]/30 outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
                    />
                    <span className="text-sm font-medium text-[#414141]/75">%</span>
                    <button
                      type="button"
                      onClick={() => clearCategoryDiscount(category.id)}
                      disabled={currentValue === undefined}
                      className="rounded-lg border border-[#dcc090]/30 px-3 py-2 text-xs font-bold text-[#414141]/70 transition-all hover:border-[#dcc090]/50 hover:bg-[#dcc090]/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t('admin.quickSettings.clear')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
