import type { HomeHeroSlide } from '@/lib/types/home-hero.types';

const DEFAULT_EN_COPY = {
  title: 'Contrary',
  description:
    'The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from',
  ctaLabel: 'Deep Dive',
} as const;

const EMPTY_BLOCK = { title: '', description: '', ctaLabel: '' } as const;

/** Fallback when DB has no `homeHero` or empty slides — matches previous static homepage. */
export const HOME_HERO_DEFAULT_SLIDES: readonly HomeHeroSlide[] = [
  {
    imageUrl: '/assets/home/concepts/hero-banner.webp',
    ctaHref: '/about',
    copy: {
      hy: { ...EMPTY_BLOCK },
      en: {
        title: DEFAULT_EN_COPY.title,
        description: DEFAULT_EN_COPY.description,
        ctaLabel: DEFAULT_EN_COPY.ctaLabel,
      },
      ru: { ...EMPTY_BLOCK },
    },
  },
] as const;
