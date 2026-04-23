'use client';

import type { ChangeEvent } from 'react';
import { ChevronRight } from 'lucide-react';

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
    <div className="rounded-xl border border-[#dcc090]/25 bg-white/95 transition-all duration-200 hover:border-[#dcc090]/50 hover:shadow-[0_4px_16px_rgba(18,42,38,0.06)]">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 text-[#122a26] transition-all hover:bg-[#dcc090]/25"
          aria-expanded={isExpanded}
          aria-controls={panelId}
          aria-label={isExpanded ? t('admin.homeHero.collapseSlide') : t('admin.homeHero.expandSlide')}
        >
          <ChevronRight
            className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            aria-hidden
          />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-sm font-black uppercase tracking-[0.08em] text-[#122a26]">
                {t('admin.homeHero.slideLabel').replace('{n}', String(index + 1))}
              </h2>
              {!isExpanded && slide.title.trim() ? (
                <p className="truncate text-xs text-[#414141]/55">{slide.title}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={slidesCount <= 1}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-all hover:bg-red-100 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('admin.homeHero.removeSlide')}
            </button>
          </div>
        </div>
      </div>

      {isExpanded ? (
        <div
          id={panelId}
          className="border-t border-[#dcc090]/20 px-4 pb-5 pt-4 grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
              {t('admin.homeHero.image')}
            </span>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="min-h-40 w-full max-w-xl overflow-hidden rounded-xl border border-[#dcc090]/25 bg-[#dcc090]/5">
                {slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={t('admin.homeHero.imagePreviewAlt').replace('{n}', String(index + 1))}
                    className="max-h-56 w-full object-contain object-center"
                  />
                ) : (
                  <div className="flex min-h-40 items-center justify-center px-4 text-center text-sm text-[#414141]/40">
                    {t('admin.homeHero.imagePlaceholder')}
                  </div>
                )}
              </div>
              <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 px-4 py-2 text-xs font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090]">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onImageFile(e)}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-[#122a26]" />
                    {t('admin.homeHero.uploading')}
                  </span>
                ) : (
                  t('admin.homeHero.uploadFile')
                )}
              </label>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
              {t('admin.homeHero.titleField')}
            </label>
            <input
              type="text"
              value={slide.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2 text-sm text-[#122a26] placeholder-[#414141]/30 outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
              {t('admin.homeHero.description')}
            </label>
            <textarea
              value={slide.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2 text-sm text-[#122a26] placeholder-[#414141]/30 outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
