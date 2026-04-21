'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Button, Card } from '@shop/ui';

import { showToast } from '../../../../components/Toast';
import { apiClient } from '../../../../lib/api-client';
import { useAuth } from '../../../../lib/auth/AuthContext';
import { useTranslation } from '../../../../lib/i18n-client';
import { logger } from '../../../../lib/utils/logger';
import { AdminSidebar } from '../../components/AdminSidebar';

import { VotingFormModal } from '../components/VotingFormModal';
import { useVotingActions } from '../hooks/useVotingActions';
import { useVotingDetail } from '../hooks/useVotingDetail';

export default function VotingDetailPage() {
  const params = useParams();
  const votingId = typeof params?.votingId === 'string' ? params.votingId : undefined;

  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { voting, items, loading, fetchDetail } = useVotingDetail(votingId);
  const {
    showAddModal,
    showEditModal,
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
  } = useVotingActions();

  const [publishBusy, setPublishBusy] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.push('/admin');
    }
  }, [isAdmin, isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && isAdmin && votingId) {
      fetchDetail().catch(() => undefined);
    }
  }, [fetchDetail, isAdmin, isLoggedIn, votingId]);

  const analytics = useMemo(() => {
    const totalLikes = items.reduce((sum, item) => sum + item.likeCount, 0);
    const topLikedItem = items.reduce<(typeof items)[number] | null>((topItem, item) => {
      if (!topItem || item.likeCount > topItem.likeCount) {
        return item;
      }

      return topItem;
    }, null);

    return {
      totalItems: items.length,
      totalLikes,
      topLikedItem: topLikedItem && topLikedItem.likeCount > 0 ? topLikedItem : null,
    };
  }, [items]);

  const togglePublished = useCallback(async () => {
    if (!votingId || !voting) {
      return;
    }

    setPublishBusy(true);

    try {
      await apiClient.patch(`/api/v1/admin/voting/${votingId}`, {
        published: !voting.published,
      });
      await fetchDetail();
      showToast(t('admin.voting.publishStateUpdated'), 'success');
    } catch (error: unknown) {
      logger.error('Error updating voting publish state', { error });
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { detail?: string } }).data?.detail
          : t('admin.voting.errorUpdatingVoting');
      showToast(message || t('admin.voting.errorUpdatingVoting'), 'error');
    } finally {
      setPublishBusy(false);
    }
  }, [fetchDetail, t, voting, votingId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
          <p className="text-gray-600">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  if (!votingId) {
    return null;
  }

  if (!loading && !voting) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-lg px-4 text-center">
          <p className="text-gray-700">{t('admin.voting.votingNotFound')}</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push('/admin/voting')}>
            {t('admin.voting.backToVotingList')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push('/admin/voting')}
            className="mb-4 flex items-center text-gray-600 transition-colors duration-200 hover:text-gray-900"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('admin.voting.backToVotingList')}
          </button>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{voting?.title ?? '—'}</h1>
              <p className="mt-2 text-sm text-gray-600">{t('admin.voting.subtitleDetail')}</p>
              {voting ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      voting.published ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {voting.published ? t('admin.voting.statusLive') : t('admin.voting.statusDraft')}
                  </span>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-teal-700 focus:ring-teal-600"
                      checked={voting.published}
                      disabled={publishBusy || loading}
                      onChange={togglePublished}
                    />
                    <span>{t('admin.voting.showOnHome')}</span>
                  </label>
                </div>
              ) : null}
            </div>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex shrink-0 items-center gap-2 self-start"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('admin.voting.addChoice')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <AdminSidebar currentPath={pathname || '/admin/voting'} router={router} t={t} />

          <div className="min-w-0 flex-1 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-5">
                <p className="text-sm font-medium text-gray-500">{t('admin.voting.totalItemsInVoting')}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.totalItems}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm font-medium text-gray-500">{t('admin.voting.totalLikes')}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.totalLikes}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm font-medium text-gray-500">{t('admin.voting.topLiked')}</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {analytics.topLikedItem?.title || t('admin.voting.noTopLiked')}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {analytics.topLikedItem ? `${analytics.topLikedItem.likeCount} ${t('admin.voting.likesLabel')}` : '—'}
                </p>
              </Card>
            </div>

            <Card className="p-6">
              {loading ? (
                <div className="py-10 text-center text-sm text-gray-500">{t('admin.voting.loadingItems')}</div>
              ) : items.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-500">{t('admin.voting.noItems')}</p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="relative h-52 bg-gray-100">
                        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                        {item.topLiked ? (
                          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-white">
                            {t('admin.voting.topLikedBadge')}
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-4 p-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.likeCount} {t('admin.voting.likesLabel')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => handleEditItem(item)} className="flex-1">
                            {t('admin.common.edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteItem(item, fetchDetail)}
                            className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            {t('admin.common.delete')}
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <VotingFormModal
        isOpen={showAddModal}
        mode="create"
        formData={formData}
        saving={saving}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        onFormDataChange={setFormData}
        onSubmit={() => handleAddItem(votingId, fetchDetail)}
      />

      <VotingFormModal
        isOpen={showEditModal}
        mode="edit"
        formData={formData}
        saving={saving}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        onFormDataChange={setFormData}
        onSubmit={() => handleUpdateItem(fetchDetail)}
      />
    </div>
  );
}
