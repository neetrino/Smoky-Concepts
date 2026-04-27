/** Matches storefront product card gallery dot cap (`ProductsCatalogCard`). */
export const MAX_VOTING_GALLERY_IMAGES = 8;

/**
 * Resolves ordered unique image URLs for a voting item (DB `galleryUrls` or legacy `imageUrl` only).
 */
export function buildVotingItemImagesForDisplay(imageUrl: string, galleryUrls: string[]): string[] {
  const gallery = galleryUrls.map((u) => u.trim()).filter(Boolean);
  const base = gallery.length > 0 ? gallery : imageUrl.trim() ? [imageUrl.trim()] : [];
  const unique = base.filter((url, index, arr) => arr.indexOf(url) === index);
  return unique.slice(0, MAX_VOTING_GALLERY_IMAGES);
}
