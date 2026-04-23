'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { apiClient } from '@/lib/api-client';
import { processImageFile } from '@/lib/services/utils/image-utils';
import { useTranslation } from '@/lib/i18n-client';
import { showToast } from '@/components/Toast';

const UPLOAD_ENDPOINT = '/api/v1/admin/size-catalog/upload-images';
const VERSION_STORAGE_KEY = 'admin.sizeCatalog.customVersions';

function getOutputFileType(file: File): string {
  if (file.type === 'image/png') return 'image/png';
  if (file.type === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

async function uploadSizeImage(imageBase64: string): Promise<string | null> {
  const response = await apiClient.post<{ urls: string[] }>(UPLOAD_ENDPOINT, { images: [imageBase64] });
  return response?.urls?.[0] ?? null;
}

function normalizeCustomVersions(versions: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const item of versions) {
    const value = item.trim();
    if (!value || value.length > 32 || seen.has(value)) continue;
    seen.add(value);
    normalized.push(value);
  }
  return normalized;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') { resolve(reader.result); return; } reject(new Error('Failed to read image')); };
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

function readStoredCustomVersions(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(VERSION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return normalizeCustomVersions(parsed.filter((v): v is string => typeof v === 'string'));
  } catch { return []; }
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
  open: false, categoryId: '', mode: 'create', itemId: null, title: '', imageUrl: '', version: '',
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
        if (!modalVersion || prev.includes(modalVersion)) return prev;
        return [...prev, modalVersion];
      });
    }
  }, [modal.open, modal.title, modal.imageUrl, modal.version, modal.itemId, modal.mode]);

  useEffect(() => {
    window.localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(normalizeCustomVersions(versionOptions)));
  }, [versionOptions]);

  useEffect(() => {
    if (!isVersionMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (!versionMenuRef.current?.contains(e.target as Node)) setIsVersionMenuOpen(false);
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isVersionMenuOpen]);

  const addVersionOption = () => {
    const entered = window.prompt(t('admin.sizes.versionPrompt'), '');
    const normalized = entered?.trim();
    if (!normalized) return;
    setVersionOptions((prev) => prev.includes(normalized) ? prev : [...prev, normalized]);
    setVersion(normalized);
  };

  const removeVersionOption = (targetVersion: string) => {
    if (!targetVersion) return;
    setVersionOptions((prev) => {
      const next = prev.filter((v) => v !== targetVersion);
      if (version === targetVersion) setVersion(next[0] ?? '');
      return next;
    });
    if (versionOptions.length <= 1) setIsVersionMenuOpen(false);
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast(t('admin.voting.imageInvalidType'), 'warning'); event.target.value = ''; return; }
    setUploading(true);
    try {
      const shouldCompress = file.size > 900 * 1024;
      const base64 = shouldCompress
        ? await processImageFile(file, { maxSizeMB: 1.2, maxWidthOrHeight: 1280, useWebWorker: true, fileType: getOutputFileType(file), initialQuality: 0.75 })
        : await readFileAsDataUrl(file);
      if (!base64) { showToast(t('admin.voting.imageUploadFailed'), 'error'); return; }
      const url = await uploadSizeImage(base64);
      if (!url) { showToast(t('admin.voting.imageUploadFailed'), 'error'); return; }
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
    if (!trimmedTitle || !trimmedUrl) { showToast(t('admin.sizes.itemFieldsRequired'), 'warning'); return; }
    setSaving(true);
    try {
      if (modal.mode === 'create' || modal.mode === 'duplicate') {
        const payload: { title: string; imageUrl: string; published: boolean; version?: string } = {
          title: trimmedTitle, imageUrl: trimmedUrl, published: modal.mode !== 'duplicate',
        };
        if (trimmedVersion) payload.version = trimmedVersion;
        await apiClient.post(`/api/v1/admin/size-catalog/categories/${modal.categoryId}/items`, payload);
      } else if (modal.itemId) {
        await apiClient.patch(`/api/v1/admin/size-catalog/items/${modal.itemId}`, {
          title: trimmedTitle, imageUrl: trimmedUrl, version: trimmedVersion || null,
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

  if (!modal.open) return null;

  const modalTitle = modal.mode === 'edit'
    ? t('admin.sizes.editItem')
    : modal.mode === 'duplicate'
      ? t('admin.sizes.duplicateItem')
      : t('admin.sizes.addItem');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#dcc090]/30 bg-white shadow-[0_24px_60px_rgba(18,42,38,0.18)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#dcc090]/20 bg-[#122a26] px-6 py-4">
          <div>
            <h3 className="text-base font-black uppercase tracking-[0.1em] text-[#dcc090]">{modalTitle}</h3>
            {modal.mode === 'duplicate' && (
              <p className="mt-0.5 text-xs text-[#dcc090]/60">{t('admin.sizes.duplicateItemHint')}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#dcc090]/60 transition-colors hover:bg-white/10 hover:text-[#dcc090]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto space-y-4 p-6">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
              {t('admin.sizes.itemTitle')}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('admin.sizes.itemTitlePlaceholder')}
              disabled={saving || uploading}
              className="w-full rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2.5 text-sm text-[#122a26] placeholder-[#414141]/30 outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30 disabled:opacity-50"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
              {t('admin.sizes.imageUrl')}
            </label>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving || uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 px-4 py-2 text-xs font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-[#122a26]" />
                    {t('admin.attributes.valueModal.uploading')}
                  </>
                ) : t('admin.sizes.uploadImage')}
              </button>
              {imageUrl && (
                <button
                  type="button"
                  disabled={saving || uploading}
                  onClick={() => setImageUrl('')}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                >
                  {t('admin.voting.removeImage')}
                </button>
              )}
            </div>
          </div>

          {/* Version picker */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
              {t('admin.sizes.version')}
            </label>
            <div className="flex items-start gap-2">
              <div className="relative w-full" ref={versionMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsVersionMenuOpen((prev) => !prev)}
                  disabled={saving || uploading}
                  className="flex h-10 w-full items-center justify-between rounded-lg border border-[#dcc090]/35 bg-white px-3 text-sm outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30 disabled:opacity-50"
                >
                  <span className={version ? 'font-bold uppercase text-[#122a26]' : 'text-[#414141]/35'}>
                    {version || t('admin.sizes.versionPrompt')}
                  </span>
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 text-[#414141]/40" aria-hidden>
                    <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {isVersionMenuOpen && (
                  <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-[#dcc090]/25 bg-white shadow-[0_8px_24px_rgba(18,42,38,0.10)]">
                    {versionOptions.length > 0 ? (
                      <ul className="max-h-52 overflow-auto py-1">
                        {versionOptions.map((v) => (
                          <li key={v} className="flex items-center justify-between gap-2 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => { setVersion(v); setIsVersionMenuOpen(false); }}
                              className={`flex-1 rounded-lg px-2 py-1.5 text-left text-sm uppercase transition-colors hover:bg-[#dcc090]/15 ${
                                version === v ? 'bg-[#dcc090]/20 font-bold text-[#122a26]' : 'text-[#414141]/75'
                              }`}
                            >
                              {v}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeVersionOption(v)}
                              disabled={saving || uploading}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#414141]/40 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6 6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-3 py-2 text-sm text-[#414141]/45">{t('admin.sizes.versionPrompt')}</p>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                title={t('admin.sizes.addVersion')}
                onClick={addVersionOption}
                disabled={saving || uploading}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dcc090]/35 bg-[#dcc090]/10 text-lg font-bold text-[#122a26] transition-all hover:bg-[#dcc090]/25 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Image preview */}
          {imageUrl && (
            <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border border-[#dcc090]/25 bg-[#dcc090]/5">
              <img src={imageUrl} alt="" className="max-h-full max-w-full object-contain" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#dcc090]/20 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-[#dcc090]/30 px-5 py-2.5 text-sm font-bold text-[#414141]/70 transition-all hover:border-[#dcc090]/50 hover:bg-[#dcc090]/10 disabled:opacity-50"
          >
            {t('admin.sizes.cancel')}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-lg bg-[#122a26] px-6 py-2.5 text-sm font-bold text-[#dcc090] shadow-[0_4px_14px_rgba(18,42,38,0.18)] transition-all hover:bg-[#18352f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? t('admin.sizes.saving') : t('admin.sizes.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
