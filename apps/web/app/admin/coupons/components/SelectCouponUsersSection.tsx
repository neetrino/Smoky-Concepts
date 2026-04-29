'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { apiClient } from '@/lib/api-client';

export interface CouponUserPickerRow {
  id: string;
  email: string | null;
  phone: string | null;
}

export interface SelectCouponUsersLabels {
  sectionTitle: string;
  sectionHint: string;
  collapsedSummaryAll: string;
  collapsedSummarySome: string;
  searchPlaceholder: string;
  adminCustomerLabel: string;
  roleAll: string;
  roleCustomers: string;
  roleAdmins: string;
  selectAll: string;
  deselectAll: string;
  loading: string;
  empty: string;
  loadError: string;
}

type RoleFilter = 'all' | 'customer' | 'admin';

interface SelectCouponUsersSectionProps {
  disabled: boolean;
  labels: SelectCouponUsersLabels;
  selectedUserIds: Set<string>;
  onSelectedChange: (next: Set<string>) => void;
}

export function SelectCouponUsersSection({
  disabled,
  labels,
  selectedUserIds,
  onSelectedChange,
}: SelectCouponUsersSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState<RoleFilter>('all');
  const [rows, setRows] = useState<CouponUserPickerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) {
        params.set('search', debouncedSearch);
      }
      params.set('role', role);
      params.set('take', '400');
      const res = await apiClient.get<{ data: CouponUserPickerRow[] }>(
        `/api/v1/admin/users?${params.toString()}`,
      );
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRows([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, role]);

  useEffect(() => {
    if (!expanded) {
      return;
    }
    void fetchUsers();
  }, [expanded, fetchUsers]);

  const visibleIds = useMemo(() => rows.map((r) => r.id), [rows]);

  const summaryText = useMemo(() => {
    if (selectedUserIds.size === 0) {
      return labels.collapsedSummaryAll;
    }
    return labels.collapsedSummarySome.replace('{count}', String(selectedUserIds.size));
  }, [labels.collapsedSummaryAll, labels.collapsedSummarySome, selectedUserIds.size]);

  const toggleUser = (userId: string) => {
    const next = new Set(selectedUserIds);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }
    onSelectedChange(next);
  };

  const selectAllVisible = () => {
    const next = new Set(selectedUserIds);
    for (const id of visibleIds) {
      next.add(id);
    }
    onSelectedChange(next);
  };

  const deselectAllVisible = () => {
    const next = new Set(selectedUserIds);
    for (const id of visibleIds) {
      next.delete(id);
    }
    onSelectedChange(next);
  };

  return (
    <div className="mt-6 border-t border-[#dcc090]/25 pt-4">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-[#dcc090]/35 bg-[#efefef]/40 px-4 py-3 text-left transition hover:bg-[#efefef]/70 disabled:opacity-60"
      >
        <div>
          <div className="text-sm font-medium text-[#122a26]">{labels.sectionTitle}</div>
          {!expanded ? (
            <div className="mt-0.5 text-xs text-[#414141]/70">{summaryText}</div>
          ) : null}
        </div>
        <span className="text-[#414141]/80" aria-hidden>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded ? (
        <div className="mt-3 space-y-3 rounded-lg border border-[#dcc090]/25 bg-white p-4">
          <p className="text-xs text-[#414141]/75">{labels.sectionHint}</p>

          <input
            type="search"
            className="w-full rounded-md border border-[#dcc090]/40 px-3 py-2 text-sm text-[#122a26]"
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
          />

          <div>
            <div className="mb-1 text-xs font-medium text-[#414141]/80">{labels.adminCustomerLabel}</div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'customer', 'admin'] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => setRole(key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    role === key
                      ? 'bg-[#122a26] text-[#dcc090]'
                      : 'border border-[#dcc090]/40 bg-white text-[#122a26] hover:bg-[#efefef]'
                  }`}
                >
                  {key === 'all' ? labels.roleAll : key === 'customer' ? labels.roleCustomers : labels.roleAdmins}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 text-xs">
            <button
              type="button"
              className="text-sky-700 underline disabled:opacity-50"
              disabled={disabled || visibleIds.length === 0}
              onClick={selectAllVisible}
            >
              {labels.selectAll}
            </button>
            <button
              type="button"
              className="text-sky-700 underline disabled:opacity-50"
              disabled={disabled || visibleIds.length === 0}
              onClick={deselectAllVisible}
            >
              {labels.deselectAll}
            </button>
          </div>

          {loading ? <p className="text-xs text-[#414141]/70">{labels.loading}</p> : null}
          {loadError ? <p className="text-xs text-red-600">{labels.loadError}</p> : null}

          {!loading && !loadError && rows.length === 0 ? (
            <p className="text-xs text-[#414141]/65">{labels.empty}</p>
          ) : null}

          {!loading && rows.length > 0 ? (
            <div className="max-h-56 overflow-y-auto rounded-md border border-[#dcc090]/20 p-2">
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {rows.map((row) => {
                  const label = row.email?.trim() || row.phone?.trim() || row.id;
                  const checked = selectedUserIds.has(row.id);
                  return (
                    <li key={row.id} className="flex items-center gap-2 text-xs text-[#122a26]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[#dcc090]/60 text-[#122a26]"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleUser(row.id)}
                      />
                      <span className="truncate">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
