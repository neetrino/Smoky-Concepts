'use client';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';

/** Delay between consecutive size cards in the open animation (ms). */
const SIZE_CARD_STAGGER_MS = 52;
/** Extra delay before the first size card animates (after panel motion). */
const SIZE_CARD_STAGGER_BASE_MS = 220;

interface SizeCatalogPickerContentProps {
  categories: SizeCatalogCategoryDto[];
  selectedItemId: string | null;
  language: LanguageCode;
  onSelectItem: (item: SizeCatalogItemDto) => void;
}

function CatalogSizeCard({
  item,
  selected,
  onSelect,
  enterDelayMs,
}: {
  item: SizeCatalogItemDto;
  selected: boolean;
  onSelect: () => void;
  enterDelayMs: number;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ animationDelay: `${enterDelayMs}ms` }}
      className={`flex h-[129px] w-full max-w-[126px] shrink-0 animate-size-catalog-card-in flex-col items-center justify-self-center rounded-[14px] bg-white pt-2 transition-shadow ${
        selected
          ? 'border-[3px] border-solid border-[#dcc090] shadow-none'
          : 'border border-transparent shadow-[0px_2px_8px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="relative h-[73px] w-[52px] shrink-0 overflow-hidden">
        <img src={item.imageUrl} alt="" className="h-full w-full object-contain" />
      </div>
      <p className="mt-2 line-clamp-2 px-1 text-center font-montserrat text-[14px] font-medium leading-tight text-[#414141]">
        {item.title}
      </p>
    </button>
  );
}

export function SizeCatalogPickerContent({
  categories,
  selectedItemId,
  language,
  onSelectItem,
}: SizeCatalogPickerContentProps) {
  const hasAny = categories.some((c) => c.items.length > 0);

  if (!hasAny) {
    return (
      <p
        className="animate-size-modal-block-in font-montserrat text-[16px] font-medium text-[#414141]"
        style={{ animationDelay: '200ms' }}
      >
        {t(language, 'product.size_catalog_empty')}
      </p>
    );
  }

  let cardStaggerIndex = 0;

  return (
    <div className="space-y-[50px] pb-8">
      {categories.map((category) => {
        if (category.items.length === 0) {
          return null;
        }
        const sectionHeadingDelayMs =
          SIZE_CARD_STAGGER_BASE_MS + cardStaggerIndex * SIZE_CARD_STAGGER_MS - 40;
        return (
          <section key={category.id}>
            <h3
              className="animate-size-modal-block-in font-montserrat text-[22px] font-extrabold leading-none text-[#414141] sm:text-[24px]"
              style={{ animationDelay: `${Math.max(0, sectionHeadingDelayMs)}ms` }}
            >
              {category.title}
            </h3>
            <div className="mt-[36px] grid grid-cols-3 gap-x-2 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-7">
              {category.items.map((item) => {
                const enterDelayMs =
                  SIZE_CARD_STAGGER_BASE_MS + cardStaggerIndex * SIZE_CARD_STAGGER_MS;
                cardStaggerIndex += 1;
                return (
                  <CatalogSizeCard
                    key={item.id}
                    item={item}
                    selected={selectedItemId === item.id}
                    enterDelayMs={enterDelayMs}
                    onSelect={() => onSelectItem(item)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
