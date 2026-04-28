'use client';

import { useEffect, type ReactNode } from 'react';

import { CatalogForProductLineRow } from './CatalogForProductLineRow';

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M7 8.5L10 11.5L13 8.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Header row — matches pre-accordion mobile filter visuals (non-interactive). */
const ACCORDION_BAR =
  'flex w-full items-center justify-between rounded-xl bg-white px-4 py-3.5 text-left shadow-[0_4px_6px_rgba(0,0,0,0.05)]';
const FILTER_SECTION_ACTIVE =
  'ring-2 ring-[#122a26] ring-offset-2 ring-offset-[#F2F2F2]';
const SELECT_CLASS =
  'h-11 w-full appearance-none rounded-xl border-2 border-[#e8e8e8] bg-white px-4 pr-10 text-[0.9375rem] font-semibold text-[#414141] outline-none transition-[border-color,background-color,color]';
const SELECT_CLASS_ACTIVE =
  'border-[#122a26] bg-[#eef3f2] text-[#122a26] ring-2 ring-[#122a26]/30 ring-offset-2 ring-offset-white';

function FilterSelectWrapper({ children }: { children: ReactNode }) {
  return (
    <label className="relative mt-2 block px-1">
      {children}
      <span className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[#414141]">
        <ChevronIcon />
      </span>
    </label>
  );
}

export interface ProductsCatalogMobileFilterSheetProps {
  open: boolean;
  onClose: () => void;
  selectedCollection: string;
  selectedColor: string;
  selectedSort: string;
  selectedSize: string;
  collectionOptions: string[];
  colorOptions: string[];
  sortOptions: Array<{ value: string; label: string }>;
  onCollectionChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onOpenSizeCatalog: () => void;
  onClearAll: () => void;
}

export function ProductsCatalogMobileFilterSheet({
  open,
  onClose,
  selectedCollection,
  selectedColor,
  selectedSort,
  selectedSize,
  collectionOptions,
  colorOptions,
  sortOptions,
  onCollectionChange,
  onColorChange,
  onSortChange,
  onOpenSizeCatalog,
  onClearAll,
}: ProductsCatalogMobileFilterSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const isCollectionActive = selectedCollection !== 'all';
  const isColorActive = selectedColor !== 'all';
  const isSortActive = selectedSort !== 'default';
  const isSizeActive = selectedSize !== 'all';

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#F2F2F2] font-montserrat lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-filter-title"
    >
      <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h2 id="mobile-filter-title" className="text-2xl font-bold text-[#333333]">
          Filter
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-full border border-[#dcc090] px-3 py-1.5 text-xs font-semibold text-[#dcc090] transition-colors hover:bg-[#dcc090]/15"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#414141] transition-colors hover:bg-black/5"
            aria-label="Close filters"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
        <div className="mb-6 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          <CatalogForProductLineRow />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <div className={`${ACCORDION_BAR} ${isCollectionActive ? FILTER_SECTION_ACTIVE : ''}`}>
              <span className="text-[0.9375rem] font-semibold text-[#333333]">Collections</span>
              <ChevronIcon className="shrink-0 text-[#414141]" />
            </div>
            <FilterSelectWrapper>
              <select
                aria-label="Collections"
                value={selectedCollection}
                onChange={(event) => onCollectionChange(event.target.value)}
                className={`${SELECT_CLASS} ${isCollectionActive ? SELECT_CLASS_ACTIVE : ''}`}
              >
                <option value="all">All collections</option>
                {collectionOptions
                  .filter((option) => option !== 'all')
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </FilterSelectWrapper>
          </div>

          <div>
            <div className={`${ACCORDION_BAR} ${isColorActive ? FILTER_SECTION_ACTIVE : ''}`}>
              <span className="text-[0.9375rem] font-semibold text-[#333333]">Color</span>
              <ChevronIcon className="shrink-0 text-[#414141]" />
            </div>
            <FilterSelectWrapper>
              <select
                aria-label="Color"
                value={selectedColor}
                onChange={(event) => onColorChange(event.target.value)}
                className={`${SELECT_CLASS} ${isColorActive ? SELECT_CLASS_ACTIVE : ''}`}
              >
                <option value="all">All</option>
                {colorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FilterSelectWrapper>
          </div>

          <div>
            <div className={`${ACCORDION_BAR} ${isSortActive ? FILTER_SECTION_ACTIVE : ''}`}>
              <span className="text-[0.9375rem] font-semibold text-[#333333]">Sort By</span>
              <ChevronIcon className="shrink-0 text-[#414141]" />
            </div>
            <FilterSelectWrapper>
              <select
                aria-label="Sort By"
                value={selectedSort}
                onChange={(event) => onSortChange(event.target.value)}
                className={`${SELECT_CLASS} ${isSortActive ? SELECT_CLASS_ACTIVE : ''}`}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterSelectWrapper>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onOpenSizeCatalog}
            className={`flex h-12 w-full items-center rounded-xl border-2 px-4 text-left text-[0.9375rem] font-semibold transition-[box-shadow,ring,border-color] ${
              isSizeActive
                ? `${FILTER_SECTION_ACTIVE} border-[#122a26] bg-[#c9b07a] text-[#122a26]`
                : 'border-transparent bg-[#dcc090] text-[#122a26]'
            }`}
          >
            {selectedSize === 'all' ? 'Select size' : selectedSize}
          </button>
        </div>
      </div>
    </div>
  );
}
