'use client';

import { useCallback, useState } from 'react';

import { apiClient } from '../../../../lib/api-client';

import type { VotingDetail, VotingItem, VotingWithItemsResponse } from '../types';

export function useVotingDetail(votingId: string | undefined) {
  const [voting, setVoting] = useState<VotingDetail | null>(null);
  const [items, setItems] = useState<VotingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!votingId) {
      setVoting(null);
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get<VotingWithItemsResponse>(`/api/v1/admin/voting/${votingId}`);
      setVoting(response.data.voting);
      setItems(Array.isArray(response.data.items) ? response.data.items : []);
    } catch {
      setVoting(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [votingId]);

  return {
    voting,
    items,
    setItems,
    loading,
    fetchDetail,
  };
}
