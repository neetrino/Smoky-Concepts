'use client';

import { useState } from 'react';

import { showToast } from '../../../../components/Toast';
import { apiClient } from '../../../../lib/api-client';
import { logger } from '../../../../lib/utils/logger';
import { useTranslation } from '../../../../lib/i18n-client';

import type { VotingFormData, VotingItem } from '../types';

const INITIAL_FORM_DATA: VotingFormData = {
  title: '',
  imageUrls: [],
  productSlug: '',
};

export function useVotingActions() {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VotingItem | null>(null);
  const [formData, setFormData] = useState<VotingFormData>(INITIAL_FORM_DATA);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingItem(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const validateForm = () => {
    if (!formData.productSlug.trim()) {
      showToast(t('admin.voting.productRequired'), 'warning');
      return false;
    }

    if (formData.imageUrls.length === 0) {
      showToast(t('admin.voting.imageRequired'), 'warning');
      return false;
    }

    return true;
  };

  const handleAddItem = async (votingId: string, fetchDetail: () => Promise<void>) => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      await apiClient.post(`/api/v1/admin/voting/${votingId}/items`, {
        title: formData.title.trim(),
        imageUrls: formData.imageUrls.map((url) => url.trim()).filter(Boolean),
        productSlug: formData.productSlug.trim() ? formData.productSlug.trim() : null,
      });
      setShowAddModal(false);
      resetForm();
      await fetchDetail();
      showToast(t('admin.voting.createdSuccess'), 'success');
    } catch (error: unknown) {
      logger.error('Error creating voting item', { error });
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { detail?: string } }).data?.detail
          : t('admin.voting.errorCreating');
      showToast(message || t('admin.voting.errorCreating'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = (item: VotingItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      imageUrls:
        item.galleryUrls.length > 0 ? [...item.galleryUrls] : item.imageUrl ? [item.imageUrl] : [],
      productSlug: item.productSlug?.trim() ?? '',
    });
    setShowEditModal(true);
  };

  const handleUpdateItem = async (fetchDetail: () => Promise<void>) => {
    if (!editingItem || !validateForm()) {
      return;
    }

    setSaving(true);

    try {
      await apiClient.put(`/api/v1/admin/voting/items/${editingItem.id}`, {
        title: formData.title.trim(),
        imageUrls: formData.imageUrls.map((url) => url.trim()).filter(Boolean),
        productSlug: formData.productSlug.trim() ? formData.productSlug.trim() : null,
      });
      setShowEditModal(false);
      setEditingItem(null);
      resetForm();
      await fetchDetail();
      showToast(t('admin.voting.updatedSuccess'), 'success');
    } catch (error: unknown) {
      logger.error('Error updating voting item', { error });
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { detail?: string } }).data?.detail
          : t('admin.voting.errorUpdating');
      showToast(message || t('admin.voting.errorUpdating'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item: VotingItem, fetchDetail: () => Promise<void>) => {
    if (!confirm(t('admin.voting.deleteConfirm').replace('{name}', item.title))) {
      return;
    }

    try {
      await apiClient.delete(`/api/v1/admin/voting/items/${item.id}`);
      await fetchDetail();
      showToast(t('admin.voting.deletedSuccess'), 'success');
    } catch (error: unknown) {
      logger.error('Error deleting voting item', { error });
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { detail?: string } }).data?.detail
          : t('admin.voting.errorDeleting');
      showToast(message || t('admin.voting.errorDeleting'), 'error');
    }
  };

  return {
    showAddModal,
    showEditModal,
    editingItem,
    formData,
    saving,
    setShowAddModal,
    setShowEditModal,
    setFormData,
    resetForm,
    handleAddItem,
    handleEditItem,
    handleUpdateItem,
    handleDeleteItem,
  };
}
