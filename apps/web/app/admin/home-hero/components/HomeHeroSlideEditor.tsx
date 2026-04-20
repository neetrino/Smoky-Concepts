'use client';

import type { ChangeEvent } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@shop/ui';

import { useTranslation } from '@/lib/i18n-client';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';

export interface HomeHeroSlideEditorProps {
  slide: HomeHeroSlide;
  index: number;
  isExpanded: boolean;
  slidesCount: number;
  isUploading: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<HomeHeroSlide>) => void;
  onImageFile: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function HomeHeroSlideEditor({
  slide,
  index,
  isExpanded,
  slidesCount,
  isUploading,
  onToggle,
  onRemove,
  onUpdate,
  onImageFile,
}: HomeHeroSlideEditorProps) {
  const { t } = useTranslation();
  const panelId = `home-hero-slide-${index}`;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50"
          aria-expanded={isExpanded}
          aria-controls={panelId}
          aria-label={
            isExpanded ? t('admin.homeHero.collapseSlide') : t('admin.homeHero.expandSlide')
          }
        >
          <ChevronRight
            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            aria-hidden
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('admin.homeHero.slideLabel').replace('{n}', String(index + 1))}
              </h2>
              {!isExpanded && slide.title.trim() ? (
                <p className="truncate text-sm text-gray-500">{slide.title}</p>
              ) : null}
            </div>
            <Button type="button" variant="secondary" onClick={onRemove} disabled={slidesCount <= 1}>
              {t('admin.homeHero.removeSlide')}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded ? (
        <div
          id={panelId}
          className="mt-4 grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              {t('admin.homeHero.image')}
            </span>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="min-h-40 w-full max-w-xl overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={t('admin.homeHero.imagePreviewAlt').replace('{n}', String(index + 1))}
                    className="max-h-56 w-full object-contain object-center"
                  />
                ) : (
                  <div className="flex min-h-40 items-center justify-center px-4 text-center text-sm text-gray-500">
                    {t('admin.homeHero.imagePlaceholder')}
                  </div>
                )}
              </div>
              <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-gray-50 hover:text-blue-800">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onImageFile(e)}
                  disabled={isUploading}
                />
                {isUploading ? t('admin.homeHero.uploading') : t('admin.homeHero.uploadFile')}
              </label>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('admin.homeHero.titleField')}
            </label>
            <input
              type="text"
              value={slide.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('admin.homeHero.description')}
            </label>
            <textarea
              value={slide.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
