'use client';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';

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
}: {
  item: SizeCatalogItemDto;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-[129px] w-[126px] shrink-0 flex-col items-center rounded-[14px] bg-white pt-2 transition-shadow ${
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
      <p className="font-montserrat text-[16px] font-medium text-[#414141]">
        {t(language, 'product.size_catalog_empty')}
      </p>
    );
  }

  return (
    <div className="space-y-[50px] pb-8">
      {categories.map((category) => {
        if (category.items.length === 0) {
          return null;
        }
        return (
          <section key={category.id}>
            <h3 className="font-montserrat text-[22px] font-extrabold leading-none text-[#414141] sm:text-[24px]">
              {category.title}
            </h3>
            <div className="mt-[36px] flex flex-wrap gap-x-4 gap-y-6">
              {category.items.map((item) => (
                <CatalogSizeCard
                  key={item.id}
                  item={item}
                  selected={selectedItemId === item.id}
                  onSelect={() => onSelectItem(item)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
