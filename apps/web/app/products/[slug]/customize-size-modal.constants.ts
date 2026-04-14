/** Static layout matching Figma nodes 4408:2488–2489 — asset paths under `public/`. */

export const CUSTOMIZE_MODAL_ASSETS = {
  ultraRed: '/assets/product/customize/pack-compact-red.png',
  ultraGold: '/assets/product/customize/pack-ultra-gold.png',
  ultraSilver: '/assets/product/customize/pack-ultra-silver.png',
  compactRed: '/assets/product/customize/pack-compact-red.png',
  compactFusion: '/assets/product/customize/pack-compact-fusion.png',
  superSilver: '/assets/product/customize/pack-super-silver.png',
  stripPack: '/assets/product/customize/pack-strip.png',
} as const;

/** Default selected option — “Marlboro Gold” in Ultra Slims (Figma). */
export const CUSTOMIZE_MODAL_DEFAULT_SELECTION = 'ultra-gold';

type StripSlot = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type CustomizeStripOptionId = `strip-${StripSlot}`;

export type CustomizeModalOptionId =
  | 'ultra-red'
  | 'ultra-gold'
  | 'ultra-silver'
  | 'compact-red'
  | 'compact-fusion'
  | 'super-silver'
  | CustomizeStripOptionId;
