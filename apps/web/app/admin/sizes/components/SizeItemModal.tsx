'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button, Input } from '@shop/ui';

import { apiClient } from '@/lib/api-client';
import { processImageFile } from '@/lib/services/utils/image-utils';
import { useTranslation } from '@/lib/i18n-client';
import { showToast } from '@/components/Toast';

const UPLOAD_ENDPOINT = '/api/v1/admin/size-catalog/upload-images';

function getOutputFileType(file: File): string {
  if (file.type === 'image/png') {
    return 'image/png';
  }
  if (file.type === 'image/webp') {
    return 'image/webp';
  }
  return 'image/jpeg';
}

async function uploadSizeImage(imageBase64: string): Promise<string | null> {
  const response = await apiClient.post<{ urls: string[] }>(UPLOAD_ENDPOINT, {
    images: [imageBase64],
  });
  return response?.urls?.[0] ?? null;
}

export interface SizeItemModalState {
  open: boolean;
  categoryId: string;
  mode: 'create' | 'edit' | 'duplicate';
  itemId: string | null;
  title: string;
  imageUrl: string;
}

interface SizeItemModalProps {
  modal: SizeItemModalState;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export const initialSizeItemModal: SizeItemModalState = {
  open: false,
  categoryId: '',
  mode: 'create',
  itemId: null,
  title: '',
  imageUrl: '',
};

export function SizeItemModal({ modal, onClose, onSaved }: SizeItemModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(modal.title);
  const [imageUrl, setImageUrl] = useState(modal.imageUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modal.open) {
      setTitle(modal.title);
      setImageUrl(modal.imageUrl);
    }
  }, [modal.open, modal.title, modal.imageUrl, modal.itemId, modal.mode]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      showToast(t('admin.voting.imageInvalidType'), 'warning');
      event.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const base64 = await processImageFile(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: getOutputFileType(file),
        initialQuality: 0.8,
      });
      if (!base64) {
        showToast(t('admin.voting.imageUploadFailed'), 'error');
        return;
      }
      const url = await uploadSizeImage(base64);
      if (!url) {
        showToast(t('admin.voting.imageUploadFailed'), 'error');
        return;
      }
      setImageUrl(url);
    } catch {
      showToast(t('admin.voting.imageUploadFailed'), 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const save = async () => {
    const trimmedTitle = title.trim();
    const trimmedUrl = imageUrl.trim();
    if (!trimmedTitle || !trimmedUrl) {
      showToast(t('admin.sizes.itemFieldsRequired'), 'warning');
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === 'create' || modal.mode === 'duplicate') {
        await apiClient.post(`/api/v1/admin/size-catalog/categories/${modal.categoryId}/items`, {
          title: trimmedTitle,
          imageUrl: trimmedUrl,
          published: modal.mode === 'duplicate' ? false : true,
        });
      } else if (modal.itemId) {
        await apiClient.patch(`/api/v1/admin/size-catalog/items/${modal.itemId}`, {
          title: trimmedTitle,
          imageUrl: trimmedUrl,
        });
      }
      showToast(t('admin.sizes.itemSaved'), 'success');
      onClose();
      await onSaved();
    } catch {
      showToast(t('admin.sizes.errorSave'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!modal.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          {modal.mode === 'edit'
            ? t('admin.sizes.editItem')
            : modal.mode === 'duplicate'
              ? t('admin.sizes.duplicateItem')
              : t('admin.sizes.addItem')}
        </h3>
        {modal.mode === 'duplicate' ? (
          <p className="mt-1 text-sm text-gray-600">{t('admin.sizes.duplicateItemHint')}</p>
        ) : null}
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('admin.sizes.itemTitle')}</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('admin.sizes.itemTitlePlaceholder')}
              disabled={saving || uploading}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('admin.sizes.imageUrl')}</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} disabled={saving || uploading} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <Button
              type="button"
              variant="secondary"
              className="mt-2"
              disabled={saving || uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? t('admin.attributes.valueModal.uploading') : t('admin.sizes.uploadImage')}
            </Button>
          </div>
          {imageUrl ? (
            <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-md bg-gray-100">
              <img src={imageUrl} alt="" className="max-h-full max-w-full object-contain" />
            </div>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            {t('admin.sizes.cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={() => void save()} disabled={saving}>
            {saving ? t('admin.sizes.saving') : t('admin.sizes.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
