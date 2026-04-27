'use client';

import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';

import { Button, Input } from '@shop/ui';

import { showToast } from '@/components/Toast';
import { apiClient } from '@/lib/api-client';
import { useTranslation } from '@/lib/i18n-client';
import { MAX_VOTING_GALLERY_IMAGES } from '@/lib/voting/voting-gallery';

import type { VotingFormData } from '../types';

const UPLOAD_IMAGES_ENDPOINT = '/api/v1/admin/voting/upload-images';

async function uploadVotingImage(imageBase64: string): Promise<string | null> {
  const response = await apiClient.post<{ urls: string[] }>(UPLOAD_IMAGES_ENDPOINT, {
    images: [imageBase64],
  });

  return response?.urls?.[0] ?? null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to read image'));
    };

    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

interface VotingFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  formData: VotingFormData;
  saving: boolean;
  onClose: () => void;
  onFormDataChange: (data: VotingFormData) => void;
  onSubmit: () => Promise<void>;
}

export function VotingFormModal({
  isOpen,
  mode,
  formData,
  saving,
  onClose,
  onFormDataChange,
  onSubmit,
}: VotingFormModalProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (formData.imageUrls.length >= MAX_VOTING_GALLERY_IMAGES) {
      showToast(t('admin.voting.maxGalleryImagesToast'), 'warning');
      event.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError(t('admin.voting.imageInvalidType'));
      event.target.value = '';
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const base64 = await readFileAsDataUrl(file);

      if (!base64) {
        setUploadError(t('admin.voting.imageUploadFailed'));
        return;
      }

      const imageUrl = await uploadVotingImage(base64);

      if (!imageUrl) {
        setUploadError(t('admin.voting.imageUploadFailed'));
        return;
      }

      onFormDataChange({
        ...formData,
        imageUrls: [...formData.imageUrls, imageUrl],
      });
    } catch {
      setUploadError(t('admin.voting.imageUploadFailed'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeImageAt = (index: number) => {
    onFormDataChange({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) {
    return null;
  }

  const isCreateMode = mode === 'create';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {isCreateMode ? t('admin.voting.addChoice') : t('admin.voting.editChoice')}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('admin.voting.titleField')} *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(event) =>
                onFormDataChange({
                  ...formData,
                  title: event.target.value,
                })
              }
              placeholder={t('admin.voting.titlePlaceholder')}
              className="w-full"
              disabled={saving || uploading}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('admin.voting.imagesField')} *
            </label>
            <p className="mb-2 text-xs text-gray-500">{t('admin.voting.galleryImagesHint')}</p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-hidden
                onChange={handleFileUpload}
                disabled={saving || uploading || formData.imageUrls.length >= MAX_VOTING_GALLERY_IMAGES}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  saving || uploading || formData.imageUrls.length >= MAX_VOTING_GALLERY_IMAGES
                }
              >
                {formData.imageUrls.length === 0
                  ? uploading
                    ? t('admin.voting.uploadingImage')
                    : t('admin.voting.uploadImage')
                  : uploading
                    ? t('admin.voting.uploadingImage')
                    : t('admin.voting.addAnotherImage')}
              </Button>
            </div>
          </div>

          {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}

          {formData.imageUrls.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3">
              {formData.imageUrls.map((url, index) => (
                <li
                  key={`${url}-${index}`}
                  className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                >
                  <img
                    src={url}
                    alt={t('admin.voting.imagePreviewAlt')}
                    className="h-36 w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeImageAt(index)}
                    disabled={saving || uploading}
                    className="absolute right-1 top-1 rounded-md bg-white/90 px-2 py-1 text-xs text-red-600 shadow-sm hover:bg-red-50"
                  >
                    {t('admin.voting.removeImage')}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="primary"
            onClick={() => onSubmit()}
            disabled={saving || uploading}
            className="flex-1"
          >
            {saving
              ? isCreateMode
                ? t('admin.voting.creating')
                : t('admin.voting.updating')
              : isCreateMode
                ? t('admin.voting.createChoice')
                : t('admin.voting.updateChoice')}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving || uploading}>
            {t('admin.common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
