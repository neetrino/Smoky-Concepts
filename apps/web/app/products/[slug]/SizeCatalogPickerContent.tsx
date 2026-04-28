'use client';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { CatalogCategorySizeBand } from './SizeCatalogCategoryBand';
import { SIZE_CARD_STAGGER_BASE_MS, SIZE_CARD_STAGGER_MS } from './sizeCatalogPicker.constants';

interface SizeCatalogPickerContentProps {
  categories: SizeCatalogCategoryDto[];
  selectedItemId: string | null;
  language: LanguageCode;
  onSelectItem: (item: SizeCatalogItemDto) => void;
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
        const staggerStart = cardStaggerIndex;
        cardStaggerIndex += category.items.length;
        return (
          <CatalogCategorySizeBand
            key={category.id}
            category={category}
            selectedItemId={selectedItemId}
            language={language}
            onSelectItem={onSelectItem}
            sectionHeadingDelayMs={sectionHeadingDelayMs}
            staggerStartIndex={staggerStart}
          />
        );
      })}
    </div>
  );
}
