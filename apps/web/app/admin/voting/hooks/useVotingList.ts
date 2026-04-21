'use client';

import { useCallback, useState } from 'react';

import { apiClient } from '../../../../lib/api-client';

import type { VotingListResponse, VotingSummary } from '../types';

export function useVotingList() {
  const [votings, setVotings] = useState<VotingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVotings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<VotingListResponse>('/api/v1/admin/voting');
      setVotings(Array.isArray(response.data) ? response.data : []);
    } catch {
      setVotings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    votings,
    setVotings,
    loading,
    fetchVotings,
  };
}
