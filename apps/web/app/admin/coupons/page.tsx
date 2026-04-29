'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../../lib/auth/AuthContext';
import { Card, Button } from '@shop/ui';
import { apiClient } from '../../../lib/api-client';
import { AdminMenuDrawer } from '../../../components/AdminMenuDrawer';
import { useTranslation } from '../../../lib/i18n-client';
import { getAdminMenuTABS } from '../admin-menu.config';
import {
  ADMIN_FIXED_SIDEBAR_CLASS,
  ADMIN_FIXED_SIDEBAR_SPACER_CLASS,
} from '../constants/adminShell.constants';
import { getAdminSidebarNavIndentClass } from '../utils/adminMenuIndent';
import { CreateCouponModal } from './components/CreateCouponModal';
import type { AdminCouponDetail, CouponFormSubmitPayload } from './types';

interface CouponRow {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  quantity: number | null;
  active: boolean;
  expiresAt: string | null;
}

type CouponModalState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; coupon: AdminCouponDetail };

export default function AdminCouponsPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<CouponModalState>({ kind: 'closed' });
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);
  const [rows, setRows] = useState<CouponRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: CouponRow[] }>('/api/v1/admin/coupons');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      alert(t('admin.coupons.loadError'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.push('/supersudo');
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      void load();
    }
  }, [isLoggedIn, isAdmin, load]);

  const modalLabels = useMemo(
    () => ({
      titleCreate: t('admin.coupons.addNew'),
      titleEdit: t('admin.coupons.editCoupon'),
      name: t('admin.coupons.name'),
      code: t('admin.coupons.code'),
      discountType: t('admin.coupons.discountType'),
      typePercent: t('admin.coupons.typePercent'),
      typeFixedUsd: t('admin.coupons.typeFixedUsd'),
      discountValue: t('admin.coupons.discountValue'),
      quantity: t('admin.coupons.quantity'),
      expiresAt: t('admin.coupons.expiresAt'),
      cancel: t('admin.common.cancel'),
      create: t('admin.coupons.create'),
      creating: t('admin.coupons.creating'),
      update: t('admin.coupons.update'),
      updating: t('admin.coupons.updating'),
      pickUsers: {
        sectionTitle: t('admin.coupons.pickUsers.sectionTitle'),
        sectionHint: t('admin.coupons.pickUsers.sectionHint'),
        collapsedSummaryAll: t('admin.coupons.pickUsers.collapsedSummaryAll'),
        collapsedSummarySome: t('admin.coupons.pickUsers.collapsedSummarySome'),
        searchPlaceholder: t('admin.coupons.pickUsers.searchPlaceholder'),
        adminCustomerLabel: t('admin.coupons.pickUsers.adminCustomerLabel'),
        roleAll: t('admin.coupons.pickUsers.roleAll'),
        roleCustomers: t('admin.coupons.pickUsers.roleCustomers'),
        roleAdmins: t('admin.coupons.pickUsers.roleAdmins'),
        selectAll: t('admin.coupons.pickUsers.selectAll'),
        deselectAll: t('admin.coupons.pickUsers.deselectAll'),
        loading: t('admin.coupons.pickUsers.loading'),
        empty: t('admin.coupons.pickUsers.empty'),
        loadError: t('admin.coupons.pickUsers.loadError'),
      },
    }),
    [t],
  );

  const handleCreate = async (payload: CouponFormSubmitPayload) => {
    setSaving(true);
    try {
      await apiClient.post('/api/v1/admin/coupons', {
        code: payload.code,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        quantity: payload.quantity,
        allowedUserIds: payload.allowedUserIds,
        active: true,
        expiresAt: payload.expiresAt,
      });
      setModal({ kind: 'closed' });
      await load();
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Error';
      alert(t('admin.coupons.saveError').replace('{message}', msg));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (couponId: string, payload: CouponFormSubmitPayload) => {
    setSaving(true);
    try {
      await apiClient.patch(`/api/v1/admin/coupons/${couponId}`, {
        code: payload.code,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        quantity: payload.quantity,
        allowedUserIds: payload.allowedUserIds,
        expiresAt: payload.expiresAt,
      });
      setModal({ kind: 'closed' });
      await load();
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Error';
      alert(t('admin.coupons.saveError').replace('{message}', msg));
    } finally {
      setSaving(false);
    }
  };

  const openEdit = async (row: CouponRow) => {
    setEditLoadingId(row.id);
    try {
      const data = await apiClient.get<AdminCouponDetail>(`/api/v1/admin/coupons/${row.id}`);
      setModal({ kind: 'edit', coupon: data });
    } catch {
      alert(t('admin.coupons.loadCouponError'));
    } finally {
      setEditLoadingId(null);
    }
  };

  const toggleActive = async (row: CouponRow) => {
    setSaving(true);
    try {
      await apiClient.patch(`/api/v1/admin/coupons/${row.id}`, { active: !row.active });
      await load();
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Error';
      alert(t('admin.coupons.saveError').replace('{message}', msg));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: CouponRow) => {
    if (!confirm(t('admin.coupons.deleteConfirm').replace('{code}', row.code))) {
      return;
    }
    setSaving(true);
    try {
      await apiClient.delete(`/api/v1/admin/coupons/${row.id}`);
      await load();
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Error';
      alert(t('admin.coupons.saveError').replace('{message}', msg));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#122a26] mx-auto mb-4" />
          <p className="text-[#414141]/70">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  const adminTabs = getAdminMenuTABS(t);

  const isModalOpen = modal.kind !== 'closed';
  const modalMode = modal.kind === 'edit' ? 'edit' : 'create';
  const editCoupon = modal.kind === 'edit' ? modal.coupon : null;

  return (
    <div className="min-h-screen bg-[#efefef] pt-[3.75rem] pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:hidden mb-6">
            <AdminMenuDrawer tabs={adminTabs} currentPath="/supersudo/coupons" />
          </div>
          <aside className={ADMIN_FIXED_SIDEBAR_CLASS}>
            <nav className="h-full space-y-1 overflow-y-auto border-r border-[#dcc090]/25 bg-[#122a26] p-3">
              {adminTabs.map((tab) => {
                const isActive =
                  pathname === tab.path ||
                  (tab.path === '/supersudo' && pathname === '/supersudo') ||
                  (tab.path !== '/supersudo' && pathname?.startsWith(tab.path));
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => router.push(tab.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${getAdminSidebarNavIndentClass(
                      tab,
                    )} ${
                      isActive
                        ? 'bg-[#dcc090] text-[#122a26]'
                        : 'text-[#dcc090]/75 hover:bg-white/5 hover:text-[#dcc090]'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${isActive ? 'text-[#122a26]' : 'text-[#dcc090]/65'}`}>
                      {tab.icon}
                    </span>
                    <span className="text-left">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
          <div className={ADMIN_FIXED_SIDEBAR_SPACER_CLASS} aria-hidden="true" />

          <div className="flex-1 min-w-0 space-y-6">
            <Card className="border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
              <h1 className="text-2xl font-semibold text-[#122a26] mb-1">{t('admin.coupons.title')}</h1>
              <p className="text-sm text-[#414141]/75 mb-6">{t('admin.coupons.subtitle')}</p>
              <div className="flex items-center justify-between rounded-lg border border-[#dcc090]/25 bg-[#efefef]/50 p-4">
                <h2 className="text-lg font-medium text-[#122a26]">{t('admin.coupons.addNew')}</h2>
                <Button
                  variant="primary"
                  onClick={() => setModal({ kind: 'create' })}
                  disabled={saving || editLoadingId !== null}
                >
                  {t('admin.coupons.create')}
                </Button>
              </div>
            </Card>

            <Card className="border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
              <h2 className="text-lg font-medium text-[#122a26] mb-4">{t('admin.coupons.listTitle')}</h2>
              {rows.length === 0 ? (
                <p className="text-[#414141]/65">{t('admin.coupons.empty')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-[#dcc090]/30 text-[#414141]/75">
                        <th className="py-2 pr-4">{t('admin.coupons.code')}</th>
                        <th className="py-2 pr-4">{t('admin.coupons.discountType')}</th>
                        <th className="py-2 pr-4">{t('admin.coupons.discountValue')}</th>
                        <th className="py-2 pr-4">{t('admin.coupons.quantity')}</th>
                        <th className="py-2 pr-4">{t('admin.coupons.active')}</th>
                        <th className="py-2 pr-4">{t('admin.coupons.expiresAt')}</th>
                        <th className="py-2 pr-4">{t('admin.coupons.actions')}</th>
                        <th className="py-2">{t('admin.coupons.delete')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="border-b border-[#dcc090]/15">
                          <td className="py-2 pr-4 font-medium text-[#122a26]">{row.code}</td>
                          <td className="py-2 pr-4">{row.discountType}</td>
                          <td className="py-2 pr-4">{row.discountValue}</td>
                          <td className="py-2 pr-4">{row.quantity ?? '∞'}</td>
                          <td className="py-2 pr-4">
                            <span className={row.active ? 'text-emerald-700' : 'text-gray-500'}>
                              {row.active ? t('admin.coupons.active') : t('admin.coupons.inactive')}
                            </span>
                            <button
                              type="button"
                              className="ml-2 text-[#122a26] underline"
                              onClick={() => void toggleActive(row)}
                              disabled={saving}
                            >
                              {t('admin.coupons.toggle')}
                            </button>
                          </td>
                          <td className="py-2 pr-4 text-[#414141]/80">
                            {row.expiresAt
                              ? new Date(row.expiresAt).toLocaleString(undefined, {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })
                              : '—'}
                          </td>
                          <td className="py-2 pr-4">
                            <button
                              type="button"
                              className="font-medium text-[#122a26] underline hover:text-[#0f221f]"
                              onClick={() => void openEdit(row)}
                              disabled={saving || editLoadingId !== null}
                            >
                              {editLoadingId === row.id ? t('admin.common.loading') : t('admin.coupons.edit')}
                            </button>
                          </td>
                          <td className="py-2">
                            <button
                              type="button"
                              className="text-red-600 hover:underline"
                              onClick={() => void handleDelete(row)}
                              disabled={saving}
                            >
                              {t('admin.coupons.delete')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <CreateCouponModal
        isOpen={isModalOpen}
        mode={modalMode}
        couponId={editCoupon?.id ?? null}
        initialValues={editCoupon}
        saving={saving}
        labels={modalLabels}
        onClose={() => setModal({ kind: 'closed' })}
        onSubmitCreate={handleCreate}
        onSubmitEdit={handleUpdate}
      />
    </div>
  );
}
