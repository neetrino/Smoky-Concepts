export type AdminUserListRoleFilter = 'all' | 'customer' | 'admin';

export interface AdminUserListFilters {
  search?: string;
  role?: AdminUserListRoleFilter;
  take?: number;
}
