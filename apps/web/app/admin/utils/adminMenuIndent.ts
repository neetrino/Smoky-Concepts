import type { AdminMenuItem } from '@/components/AdminMenuDrawer';

export function getAdminSidebarNavIndentClass(tab: AdminMenuItem): string {
  if (tab.isNestedSubCategory) {
    return 'pl-16';
  }
  if (tab.isSubCategory) {
    return 'pl-12';
  }
  return '';
}

export function getAdminDrawerNavIndentClass(tab: AdminMenuItem): string {
  if (tab.isNestedSubCategory) {
    return 'pl-12';
  }
  if (tab.isSubCategory) {
    return 'pl-8';
  }
  return '';
}
