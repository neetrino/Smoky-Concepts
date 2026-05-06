'use client';

import { useEffect, useMemo, useState } from 'react';

import { MAX_VOTING_GALLERY_IMAGES } from '@/lib/voting/voting-gallery';

interface CultureVotingCardProps {
  id: string;
  title: string;
  images: string[];
  likedByCurrentUser: boolean;
  pending: boolean;
  earlyAccessPending?: boolean;
  onToggleLike: (itemId: string, likedByCurrentUser: boolean) => Promise<void>;
  onEarlyAccess?: (itemId: string) => void;
  /** Nudge image down on desktop only (e.g. middle card alignment). */
  imageNudgeDown?: boolean;
  /** Make mobile card back area slightly smaller. */
  mobileCompactBack?: boolean;
  sizeLabel?: string;
  variantLabel?: string;
  showEarlyAccess?: boolean;
  earlyAccessLabel?: string;
}

const DOTS_ROW_CLASS =
  'flex min-h-3 items-center gap-[0.3125rem] mb-1 sm:mb-2';

interface CultureVotingImageDotsProps {
  itemId: string;
  visibleDotCount: number;
  activeImageIndex: number;
  onSelect: (index: number) => void;
}

function CultureVotingImageDots({
  itemId,
  visibleDotCount,
  activeImageIndex,
  onSelect,
}: CultureVotingImageDotsProps) {
  if (visibleDotCount <= 0) {
    return <div className="min-h-3 sm:mb-2" aria-hidden />;
  }

  if (visibleDotCount === 1) {
    return (
      <div className={DOTS_ROW_CLASS} aria-hidden="true">
        <span className="block h-[0.25rem] w-[1.625rem] shrink-0 rounded-[0.15625rem] bg-[#122a26]" />
      </div>
    );
  }

  return (
    <div className={DOTS_ROW_CLASS} role="tablist" aria-label="Images">
      {Array.from({ length: visibleDotCount }).map((_, index) => {
        const isActive = index === activeImageIndex;
        return (
          <button
            key={`${itemId}-dot-${index}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(index)}
            className="relative flex h-3 w-[1.625rem] cursor-pointer items-center"
            aria-label={`Select image ${index + 1} of ${visibleDotCount}`}
          >
            <span
              className={`block h-[0.25rem] w-full rounded-[0.15625rem] transition-colors ${
                isActive ? 'bg-[#122a26]' : 'bg-[#d9d9d9]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21z"
      />
    </svg>
  );
}

function useCultureVotingCardGallery(images: string[], id: string) {
  const displayImages = useMemo(() => {
    const trimmed = images.map((u) => u.trim()).filter(Boolean);
    const unique = trimmed.filter((url, index, arr) => arr.indexOf(url) === index);
    return unique.slice(0, MAX_VOTING_GALLERY_IMAGES);
  }, [images]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const visibleDotCount = Math.min(displayImages.length, MAX_VOTING_GALLERY_IMAGES);
  const activeSrc = displayImages[activeImageIndex] ?? '';

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  useEffect(() => {
    setActiveImageIndex((previous) => {
      if (displayImages.length === 0) {
        return 0;
      }
      return previous >= displayImages.length ? 0 : previous;
    });
  }, [id, displayImages.length]);

  useEffect(() => {
    setImageError(false);
  }, [activeImageIndex, id]);

  return {
    activeImageIndex,
    setActiveImageIndex,
    visibleDotCount,
    activeSrc,
    imageError,
    onHeroImageError: () => setImageError(true),
  };
}

export function CultureVotingCard({
  id,
  title,
  images,
  likedByCurrentUser,
  pending,
  earlyAccessPending = false,
  onToggleLike,
  onEarlyAccess,
  imageNudgeDown = false,
  mobileCompactBack = false,
  sizeLabel,
  variantLabel,
  showEarlyAccess = false,
  earlyAccessLabel = 'Early Access',
}: CultureVotingCardProps) {
  const {
    activeImageIndex,
    setActiveImageIndex,
    visibleDotCount,
    activeSrc,
    imageError,
    onHeroImageError,
  } = useCultureVotingCardGallery(images, id);

  const imageNudgeClassName = imageNudgeDown ? 'sm:translate-y-2' : '';
  const imageScaleClassName = imageNudgeDown ? 'scale-[1.28] sm:scale-[1.32]' : 'scale-[1.34] sm:scale-[1.38]';
  const mobileTopPaddingClassName = mobileCompactBack ? 'pt-[7.6rem]' : 'pt-[8.25rem]';
  const mobileContentOffsetClassName = mobileCompactBack ? 'translate-y-1' : 'translate-y-0';
  const mobileTitleOffsetClassName = mobileCompactBack ? 'translate-y-1' : '';

  return (
    <article
      className={`relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[8.75rem] flex-col overflow-visible rounded-3xl bg-white p-2 ${mobileTopPaddingClassName} sm:max-w-[10.75rem] sm:p-3 sm:pt-3 lg:max-w-none`}
    >
      <div
        className={`absolute left-3 right-3 top-[-1.5rem] z-10 h-[15rem] shrink-0 overflow-visible rounded-2xl sm:relative sm:left-auto sm:right-auto sm:top-auto sm:-mt-[4.9rem] sm:mb-2 sm:h-[12.4rem] ${imageNudgeClassName}`.trim()}
      >
        {activeSrc && !imageError ? (
          <img
            key={`${id}-${activeImageIndex}-${activeSrc}`}
            src={activeSrc}
            alt={title}
            className={`h-full w-full translate-y-1 object-contain object-top sm:translate-y-1.5 ${imageScaleClassName}`}
            loading="lazy"
            onError={onHeroImageError}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#f1f1ef] text-xs font-medium text-[#9d9d9d]">
            No image
          </div>
        )}
      </div>

      <div className={`mt-0 flex min-h-0 flex-1 flex-col gap-2 sm:gap-2.5 ${mobileContentOffsetClassName} sm:mt-2 sm:translate-y-0`}>
        <CultureVotingImageDots
          itemId={id}
          visibleDotCount={visibleDotCount}
          activeImageIndex={activeImageIndex}
          onSelect={setActiveImageIndex}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-2">
          <h3
            className={`min-h-[1.1rem] text-[11px] font-extrabold leading-[1.1] text-[#414141] line-clamp-2 sm:min-h-0 sm:text-[1.06rem] sm:leading-[1.1] ${mobileTitleOffsetClassName}`}
          >
            {title}
          </h3>
          {sizeLabel || variantLabel ? (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-1">
              {sizeLabel ? <span className="whitespace-nowrap text-xs font-medium text-[#9d9d9d] sm:text-[11px]">{sizeLabel}</span> : null}
              {variantLabel ? (
                <span className="rounded-md bg-[#122a26] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white sm:text-[9.5px]">
                  {variantLabel}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          className={`flex min-h-[1.75rem] shrink-0 items-center gap-2 ${showEarlyAccess ? 'justify-between' : 'justify-end'}`}
        >
          {showEarlyAccess ? (
            <button
              type="button"
              onClick={() => onEarlyAccess?.(id)}
              disabled={pending || earlyAccessPending}
              className={`whitespace-nowrap rounded-md border border-[#dcc090] px-2 py-1 text-xs font-extrabold leading-none text-[#dcc090] transition-colors hover:bg-[#dcc090]/10 sm:px-2 sm:py-0.5 sm:text-[11px] ${
                pending || earlyAccessPending ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              }`}
              aria-label={earlyAccessLabel}
            >
              {earlyAccessLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onToggleLike(id, likedByCurrentUser)}
            disabled={pending}
            className={`inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 text-[#731818] transition-colors hover:bg-[#731818]/10 sm:p-1 ${
              pending ? 'cursor-not-allowed opacity-60' : ''
            }`}
            aria-pressed={likedByCurrentUser}
            aria-label={likedByCurrentUser ? `Remove like from ${title}` : `Like ${title}`}
          >
            <HeartIcon filled={likedByCurrentUser} />
          </button>
        </div>
      </div>
    </article>
  );
}
