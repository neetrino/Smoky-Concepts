'use client';

import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { processImageFile } from '@/lib/services/utils/image-utils';
import { useTranslation } from '../../../../lib/i18n-client';

const UPLOAD_IMAGES_ENDPOINT = '/api/v1/admin/products/upload-images';

function getOutputFileType(file: File): string {
  const fileType = file.type?.toLowerCase();
  if (fileType === 'image/png') return 'image/png';
  if (fileType === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

async function uploadCategoryImage(imageBase64: string): Promise<string | null> {
  const response = await apiClient.post<{ urls: string[] }>(UPLOAD_IMAGES_ENDPOINT, {
    images: [imageBase64],
  });
  return response?.urls?.[0] ?? null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') { resolve(reader.result); return; }
      reject(new Error('Failed to read image'));
    };
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

interface CategoryImageFieldProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function CategoryImageField({ value, disabled = false, onChange }: CategoryImageFieldProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('admin.categories.imageInvalidType'));
      event.target.value = '';
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const shouldCompress = file.size > 900 * 1024;
      const base64 = shouldCompress
        ? await processImageFile(file, {
            maxSizeMB: 1.2,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
            fileType: getOutputFileType(file),
            initialQuality: 0.75,
          })
        : await readFileAsDataUrl(file);

      if (!base64) { setError(t('admin.categories.imageUploadFailed')); return; }

      const imageUrl = await uploadCategoryImage(base64);
      if (!imageUrl) { setError(t('admin.categories.imageUploadFailed')); return; }

      onChange(imageUrl);
    } catch {
      setError(t('admin.categories.imageUploadFailed'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
        {t('admin.categories.image')}
      </label>

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-hidden
          onChange={handleFileUpload}
          disabled={disabled || uploading}
        />
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 px-4 py-2 text-xs font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-[#122a26]" />
              {t('admin.categories.uploadingImage')}
            </>
          ) : (
            t('admin.categories.uploadImage')
          )}
        </button>

        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled || uploading}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-all hover:bg-red-100 hover:border-red-300 disabled:opacity-50"
          >
            {t('admin.categories.removeImage')}
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {value ? (
        <div className="overflow-hidden rounded-xl border border-[#dcc090]/25 bg-[#dcc090]/5 p-3">
          <img src={value} alt={t('admin.categories.imagePreviewAlt')} className="h-32 w-full object-contain" />
        </div>
      ) : null}
    </div>
  );
}
