/** Delay between consecutive size cards in the open animation (ms). */
export const SIZE_CARD_STAGGER_MS = 52;
/** Extra delay before the first size card animates (after panel motion). */
export const SIZE_CARD_STAGGER_BASE_MS = 220;
/**
 * Base delay for cards when a non-first page scrolls into view (matches modal block stagger ~90ms).
 */
export const SIZE_CATALOG_PAGE_CARD_STAGGER_BASE_MS = 90;
/** Intersection ratio at which a catalog page is treated as “entered” for reveal animation. */
export const SIZE_CATALOG_PAGE_INTERSECT_VISIBLE_RATIO = 0.35;
/** Below this ratio the page is treated as left, so a later re-enter can replay the reveal. */
export const SIZE_CATALOG_PAGE_INTERSECT_HIDDEN_RATIO = 0.15;
