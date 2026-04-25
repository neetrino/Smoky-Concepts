'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useTranslation } from '../../../lib/i18n-client';
import { AdminShell } from '../components/AdminShell';
import { CategoryAttributesEditor } from './components/CategoryAttributesEditor';
import { ADMIN_CENTERED_LOADING_CLASS, ADMIN_PAGE_SHELL_CLASS } from '../constants/adminShell.constants';

export default function AdminAttributesPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn || !isAdmin) {
        router.push('/supersudo');
      }
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className={ADMIN_CENTERED_LOADING_CLASS}>
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

  return (
    <div className={ADMIN_PAGE_SHELL_CLASS}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminShell>
          <div className="overflow-hidden rounded-2xl border border-[#dcc090]/30 bg-white/90 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
            <div className="border-b border-[#dcc090]/20 bg-[#122a26] px-6 py-4">
              <h2 className="text-base font-black uppercase tracking-[0.1em] text-[#dcc090]">
                {t('admin.attributes.title')}
              </h2>
            </div>
            <div className="p-6">
              <CategoryAttributesEditor />
            </div>
          </div>
        </AdminShell>
      </div>
    </div>
  );
}
