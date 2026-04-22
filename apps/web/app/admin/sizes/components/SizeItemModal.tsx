'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button, Input } from '@shop/ui';

import { apiClient } from '@/lib/api-client';
import { processImageFile } from '@/lib/services/utils/image-utils';
import { useTranslation } from '@/lib/i18n-client';
import { showToast } from '@/components/Toast';

const UPLOAD_ENDPOINT = '/api/v1/admin/size-catalog/upload-images';
const VERSION_STORAGE_KEY = 'admin.sizeCatalog.customVersions';

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

function normalizeCustomVersions(versions: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const item of versions) {
    const value = item.trim();
    if (!value || value.length > 32) {
      continue;
    }
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);
    normalized.push(value);
  }
  return normalized;
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

function readStoredCustomVersions(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(VERSION_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return normalizeCustomVersions(parsed.filter((value): value is string => typeof value === 'string'));
  } catch {
    return [];
  }
}

export interface SizeItemModalState {
  open: boolean;
  categoryId: string;
  mode: 'create' | 'edit' | 'duplicate';
  itemId: string | null;
  title: string;
  imageUrl: string;
  version: string;
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
  version: '',
};

export function SizeItemModal({ modal, onClose, onSaved }: SizeItemModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(modal.title);
  const [imageUrl, setImageUrl] = useState(modal.imageUrl);
  const [version, setVersion] = useState(modal.version || '');
  const [versionOptions, setVersionOptions] = useState<string[]>(() => [...readStoredCustomVersions()]);
  const [isVersionMenuOpen, setIsVersionMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const versionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modal.open) {
      setTitle(modal.title);
      setImageUrl(modal.imageUrl);
      const modalVersion = modal.version?.trim() || '';
      setVersion(modalVersion);
      setVersionOptions((prev) => {
        if (!modalVersion) {
          return prev;
        }
        if (prev.includes(modalVersion)) {
          return prev;
        }
        return [...prev, modalVersion];
      });
    }
  }, [modal.open, modal.title, modal.imageUrl, modal.version, modal.itemId, modal.mode]);

  useEffect(() => {
    const customVersions = normalizeCustomVersions(versionOptions);
    window.localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(customVersions));
  }, [versionOptions]);

  useEffect(() => {
    if (!isVersionMenuOpen) {
      return;
    }
    const handleOutsideClick = (event: MouseEvent) => {
      if (!versionMenuRef.current?.contains(event.target as Node)) {
        setIsVersionMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isVersionMenuOpen]);

  const addVersionOption = () => {
    const entered = window.prompt(t('admin.sizes.versionPrompt'), '');
    const normalized = entered?.trim();
    if (!normalized) {
      return;
    }
    setVersionOptions((prev) => {
      if (prev.includes(normalized)) {
        return prev;
      }
      return [...prev, normalized];
    });
    setVersion(normalized);
  };

  const removeVersionOption = (targetVersion: string) => {
    if (!targetVersion) {
      return;
    }
    setVersionOptions((prev) => {
      const next = prev.filter((itemVersion) => itemVersion !== targetVersion);
      if (version === targetVersion) {
        setVersion(next[0] ?? '');
      }
      return next;
    });
    if (versionOptions.length <= 1) {
      setIsVersionMenuOpen(false);
    }
  };

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
    const trimmedVersion = version.trim();
    if (!trimmedTitle || !trimmedUrl) {
      showToast(t('admin.sizes.itemFieldsRequired'), 'warning');
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === 'create' || modal.mode === 'duplicate') {
        const payload: {
          title: string;
          imageUrl: string;
          published: boolean;
          version?: string;
        } = {
          title: trimmedTitle,
          imageUrl: trimmedUrl,
          published: modal.mode === 'duplicate' ? false : true,
        };
        if (trimmedVersion) {
          payload.version = trimmedVersion;
        }
        await apiClient.post(`/api/v1/admin/size-catalog/categories/${modal.categoryId}/items`, payload);
      } else if (modal.itemId) {
        await apiClient.patch(`/api/v1/admin/size-catalog/items/${modal.itemId}`, {
          title: trimmedTitle,
          imageUrl: trimmedUrl,
          version: trimmedVersion || null,
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
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={saving || uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? t('admin.attributes.valueModal.uploading') : t('admin.sizes.uploadImage')}
              </Button>
              {imageUrl ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving || uploading}
                  onClick={() => setImageUrl('')}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  {t('admin.voting.removeImage')}
                </Button>
              ) : null}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t('admin.sizes.version')}</label>
            <div className="flex items-start gap-2">
              <div className="relative w-full" ref={versionMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsVersionMenuOpen((prev) => !prev)}
                  disabled={saving || uploading}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 px-3 text-sm text-gray-900 focus:border-gray-500 focus:outline-none"
                >
                  <span className={version ? 'uppercase' : 'text-gray-500'}>{version || t('admin.sizes.versionPrompt')}</span>
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-gray-500" aria-hidden>
                    <path
                      d="m5 7.5 5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {isVersionMenuOpen ? (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                    {versionOptions.length > 0 ? (
                      <ul className="max-h-52 overflow-auto py-1">
                        {versionOptions.map((itemVersion) => (
                          <li key={itemVersion} className="flex items-center justify-between gap-2 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => {
                                setVersion(itemVersion);
                                setIsVersionMenuOpen(false);
                              }}
                              className={`flex-1 rounded px-2 py-1 text-left text-sm uppercase hover:bg-gray-100 ${
                                version === itemVersion ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              {itemVersion}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVersionOption(itemVersion)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                              aria-label={`Delete ${itemVersion}`}
                              disabled={saving || uploading}
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6 6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-3 py-2 text-sm text-gray-500">{t('admin.sizes.versionPrompt')}</p>
                    )}
                  </div>
                ) : null}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-10 w-10 p-0 text-lg leading-none"
                title={t('admin.sizes.addVersion')}
                onClick={addVersionOption}
                disabled={saving || uploading}
              >
                +
              </Button>
            </div>
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
