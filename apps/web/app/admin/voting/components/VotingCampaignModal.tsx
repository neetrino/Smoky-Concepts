'use client';

import { useEffect, useState } from 'react';

import { Button, Input } from '@shop/ui';

import { useTranslation } from '@/lib/i18n-client';

interface VotingCampaignModalProps {
  isOpen: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
}

export function VotingCampaignModal({ isOpen, saving, onClose, onSubmit }: VotingCampaignModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    await onSubmit(title.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">{t('admin.voting.addVoting')}</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('admin.voting.votingNameField')} *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('admin.voting.votingNamePlaceholder')}
              disabled={saving}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="primary" onClick={handleSubmit} disabled={saving || !title.trim()} className="flex-1">
            {saving ? t('admin.voting.creatingVoting') : t('admin.voting.createVoting')}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            {t('admin.common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}
