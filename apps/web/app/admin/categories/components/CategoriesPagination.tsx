'use client';

import { useTranslation } from '../../../../lib/i18n-client';

interface CategoriesPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function CategoriesPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: CategoriesPaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between border-t border-[#dcc090]/20 pt-4">
      <div className="text-xs font-semibold text-[#414141]/55">
        {t('admin.categories.showingPage')
          .replace('{page}', currentPage.toString())
          .replace('{totalPages}', totalPages.toString())
          .replace('{total}', totalItems.toString())}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-lg border border-[#dcc090]/30 px-3 py-1.5 text-xs font-bold text-[#414141]/70 transition-all hover:border-[#dcc090]/50 hover:bg-[#dcc090]/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('admin.categories.previous')}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-[#dcc090]/30 px-3 py-1.5 text-xs font-bold text-[#414141]/70 transition-all hover:border-[#dcc090]/50 hover:bg-[#dcc090]/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t('admin.categories.next')}
        </button>
      </div>
    </div>
  );
}
