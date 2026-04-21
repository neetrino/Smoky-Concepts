'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Card } from '@shop/ui';

import { showToast } from '../../../components/Toast';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useTranslation } from '../../../lib/i18n-client';
import { logger } from '../../../lib/utils/logger';
import { AdminSidebar } from '../components/AdminSidebar';

import { VotingCampaignModal } from './components/VotingCampaignModal';
import { useVotingList } from './hooks/useVotingList';

export default function VotingPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { votings, loading, fetchVotings } = useVotingList();
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [busyVotingId, setBusyVotingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.push('/admin');
    }
  }, [isAdmin, isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchVotings().catch(() => undefined);
    }
  }, [fetchVotings, isAdmin, isLoggedIn]);

  const analytics = useMemo(() => {
    const totalItems = votings.reduce((sum, v) => sum + v.itemCount, 0);
    const totalLikes = votings.reduce((sum, v) => sum + v.totalLikes, 0);

    return {
      totalVotings: votings.length,
      totalItems,
      totalLikes,
    };
  }, [votings]);

  const handleCreateVoting = useCallback(
    async (title: string) => {
      if (!title) {
        showToast(t('admin.voting.votingNameRequired'), 'warning');
        return;
      }

      setSavingCampaign(true);

      try {
        const response = await apiClient.post<{ data: { id: string } }>('/api/v1/admin/voting', {
          title,
        });
        setShowCampaignModal(false);
        await fetchVotings();
        showToast(t('admin.voting.votingCreatedSuccess'), 'success');
        router.push(`/admin/voting/${response.data.id}`);
      } catch (error: unknown) {
        logger.error('Error creating voting', { error });
        const message =
          error && typeof error === 'object' && 'data' in error
            ? (error as { data?: { detail?: string } }).data?.detail
            : t('admin.voting.errorCreatingVoting');
        showToast(message || t('admin.voting.errorCreatingVoting'), 'error');
      } finally {
        setSavingCampaign(false);
      }
    },
    [fetchVotings, router, t],
  );

  const togglePublished = useCallback(
    async (id: string, published: boolean) => {
      setBusyVotingId(id);

      try {
        await apiClient.patch(`/api/v1/admin/voting/${id}`, { published });
        await fetchVotings();
        showToast(t('admin.voting.publishStateUpdated'), 'success');
      } catch (error: unknown) {
        logger.error('Error updating voting publish state', { error });
        const message =
          error && typeof error === 'object' && 'data' in error
            ? (error as { data?: { detail?: string } }).data?.detail
            : t('admin.voting.errorUpdatingVoting');
        showToast(message || t('admin.voting.errorUpdatingVoting'), 'error');
      } finally {
        setBusyVotingId(null);
      }
    },
    [fetchVotings, t],
  );

  const deleteVoting = useCallback(
    async (id: string, name: string) => {
      if (!confirm(t('admin.voting.votingDeleteConfirm').replace('{name}', name))) {
        return;
      }

      setBusyVotingId(id);

      try {
        await apiClient.delete(`/api/v1/admin/voting/${id}`);
        await fetchVotings();
        showToast(t('admin.voting.votingDeletedSuccess'), 'success');
      } catch (error: unknown) {
        logger.error('Error deleting voting', { error });
        const message =
          error && typeof error === 'object' && 'data' in error
            ? (error as { data?: { detail?: string } }).data?.detail
            : t('admin.voting.errorDeletingVoting');
        showToast(message || t('admin.voting.errorDeletingVoting'), 'error');
      } finally {
        setBusyVotingId(null);
      }
    },
    [fetchVotings, t],
  );

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="mb-4 flex items-center text-gray-600 transition-colors duration-200 hover:text-gray-900"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('admin.voting.backToAdmin')}
          </button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('admin.voting.title')}</h1>
              <p className="mt-2 text-sm text-gray-600">{t('admin.voting.subtitleList')}</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('admin.voting.addVoting')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <AdminSidebar currentPath={pathname || '/admin/voting'} router={router} t={t} />

          <div className="min-w-0 flex-1 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-5">
                <p className="text-sm font-medium text-gray-500">{t('admin.voting.totalVotings')}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.totalVotings}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm font-medium text-gray-500">{t('admin.voting.totalItemsAll')}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.totalItems}</p>
              </Card>
              <Card className="p-5">
                <p className="text-sm font-medium text-gray-500">{t('admin.voting.totalLikes')}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{analytics.totalLikes}</p>
              </Card>
            </div>

            <Card className="p-6">
              {loading ? (
                <div className="py-10 text-center text-sm text-gray-500">{t('admin.voting.loadingVotings')}</div>
              ) : votings.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-500">{t('admin.voting.noVotings')}</p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {votings.map((voting) => {
                    const disabled = busyVotingId === voting.id;

                    return (
                      <article
                        key={voting.id}
                        className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">{voting.title}</h2>
                            <p className="mt-2 text-sm text-gray-500">
                              {voting.itemCount} {t('admin.voting.choicesLabel')} · {voting.totalLikes}{' '}
                              {t('admin.voting.likesLabel')}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              voting.published ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {voting.published ? t('admin.voting.statusLive') : t('admin.voting.statusDraft')}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-teal-700 focus:ring-teal-600"
                              checked={voting.published}
                              disabled={disabled}
                              onChange={() => togglePublished(voting.id, !voting.published)}
                            />
                            <span>{t('admin.voting.showOnHome')}</span>
                          </label>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="primary"
                            className="flex-1 min-w-[8rem]"
                            onClick={() => router.push(`/admin/voting/${voting.id}`)}
                            disabled={disabled}
                          >
                            {t('admin.voting.manageChoices')}
                          </Button>
                          <Button
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => deleteVoting(voting.id, voting.title)}
                            disabled={disabled}
                          >
                            {t('admin.common.delete')}
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <VotingCampaignModal
        isOpen={showCampaignModal}
        saving={savingCampaign}
        onClose={() => setShowCampaignModal(false)}
        onSubmit={handleCreateVoting}
      />
    </div>
  );
}
