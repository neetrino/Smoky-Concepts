'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../lib/i18n-client';
import { AdminShell } from '../components/AdminShell';
import { GlobalDiscountCard } from './components/GlobalDiscountCard';
import { QuickInfoCard } from './components/QuickInfoCard';
import { CategoryDiscountsCard } from './components/CategoryDiscountsCard';
import { ProductDiscountsCard, type Product } from './components/ProductDiscountsCard';
import { ADMIN_PAGE_SHELL_CLASS } from '../constants/adminShell.constants';

interface AdminCategory {
  id: string;
  title: string;
  parentId: string | null;
}

interface QuickSettingsContentProps {
  currentPath: string;
  router: ReturnType<typeof useRouter>;
  t: ReturnType<typeof useTranslation>['t'];
  globalDiscount: number;
  setGlobalDiscount: (value: number) => void;
  discountLoading: boolean;
  discountSaving: boolean;
  handleDiscountSave: () => void;
  categories: AdminCategory[];
  categoriesLoading: boolean;
  categoryDiscounts: Record<string, number>;
  updateCategoryDiscountValue: (categoryId: string, value: string) => void;
  clearCategoryDiscount: (categoryId: string) => void;
  handleCategoryDiscountSave: () => void;
  categorySaving: boolean;
  products: Product[];
  productsLoading: boolean;
  productDiscounts: Record<string, number>;
  setProductDiscounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleProductDiscountSave: (productId: string) => void;
  savingProductId: string | null;
}

export function QuickSettingsContent({
  t,
  globalDiscount,
  setGlobalDiscount,
  discountLoading,
  discountSaving,
  handleDiscountSave,
  categories,
  categoriesLoading,
  categoryDiscounts,
  updateCategoryDiscountValue,
  clearCategoryDiscount,
  handleCategoryDiscountSave,
  categorySaving,
  products,
  productsLoading,
  productDiscounts,
  setProductDiscounts,
  handleProductDiscountSave,
  savingProductId,
}: QuickSettingsContentProps) {
  return (
    <div className={ADMIN_PAGE_SHELL_CLASS}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminShell>
          <div className="space-y-5">
            {/* Global discount + info */}
            <div className="overflow-hidden rounded-2xl border border-[#dcc090]/30 bg-white/90 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
              <div className="border-b border-[#dcc090]/20 bg-[#122a26] px-6 py-4">
                <h2 className="text-base font-black uppercase tracking-[0.1em] text-[#dcc090]">
                  {t('admin.quickSettings.quickSettingsTitle')}
                </h2>
                <p className="mt-0.5 text-xs text-[#dcc090]/55">{t('admin.quickSettings.quickSettingsSubtitle')}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <GlobalDiscountCard
                  globalDiscount={globalDiscount}
                  setGlobalDiscount={setGlobalDiscount}
                  discountLoading={discountLoading}
                  discountSaving={discountSaving}
                  handleDiscountSave={handleDiscountSave}
                />
                <QuickInfoCard />
              </div>
            </div>

            <CategoryDiscountsCard
              categories={categories}
              categoriesLoading={categoriesLoading}
              categoryDiscounts={categoryDiscounts}
              updateCategoryDiscountValue={updateCategoryDiscountValue}
              clearCategoryDiscount={clearCategoryDiscount}
              handleCategoryDiscountSave={handleCategoryDiscountSave}
              categorySaving={categorySaving}
            />

            <ProductDiscountsCard
              products={products}
              productsLoading={productsLoading}
              productDiscounts={productDiscounts}
              setProductDiscounts={setProductDiscounts}
              handleProductDiscountSave={handleProductDiscountSave}
              savingProductId={savingProductId}
            />
          </div>
        </AdminShell>
      </div>
    </div>
  );
}
