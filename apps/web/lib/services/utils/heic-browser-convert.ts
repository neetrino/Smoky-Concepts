/**
 * HEIC/HEIF handling for admin uploads: iPhone photos often use HEIC, while
 * browsers and `browser-image-compression` decode JPEG/PNG/WebP only.
 */

import { logger } from './logger';

const HEIC_EXTENSIONS = new Set(['.heic', '.heif']);

function extensionLower(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot < 0) {
    return '';
  }
  return name.slice(dot).toLowerCase();
}

/** MIME or extension indicates Apple HEIC/HEIF container. */
export function isHeicOrHeifFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (mime === 'image/heic' || mime === 'image/heif' || mime === 'image/heif-sequence') {
    return true;
  }
  return HEIC_EXTENSIONS.has(extensionLower(file.name));
}

/**
 * Accept HEIC when the OS leaves `type` empty (common on Windows) but the name ends in .heic/.heif.
 */
export function isLikelyRasterImageFileForAdminUpload(file: File): boolean {
  const mime = (file.type || '').trim().toLowerCase();
  if (mime.startsWith('image/')) {
    return true;
  }
  return isHeicOrHeifFile(file);
}

/** Use on `<input type="file" accept={...}>` so pickers allow HEIC where supported. */
export const ADMIN_RASTER_IMAGE_FILE_ACCEPT = 'image/*,.heic,.heif,image/heic,image/heif';

/**
 * Decodes HEIC/HEIF to a JPEG `File` in-browser; returns the original file otherwise.
 * Dynamic-imports `heic2any` only when needed to avoid bloating the main bundle.
 */
export async function ensureBrowserDecodableImageFile(file: File): Promise<File> {
  if (!isHeicOrHeifFile(file)) {
    return file;
  }
  if (typeof window === 'undefined') {
    throw new Error('HEIC conversion requires a browser');
  }

  try {
    const heic2any = (await import('heic2any')).default;
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92,
    });
    const blob = Array.isArray(result) ? result[0] : result;
    if (!blob || !(blob instanceof Blob)) {
      throw new Error('HEIC conversion produced no output');
    }
    const stem = file.name.replace(/\.(heic|heif)$/i, '') || 'image';
    return new File([blob], `${stem}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : 'unknown error';
    logger.error('HEIC conversion failed', { fileName: file.name, detail });
    throw new Error(
      `Could not read HEIC/HEIF file "${file.name}". Try opening it in Photos and exporting as JPEG, or use a smaller image.`
    );
  }
}
