/** localStorage key for admin panel light/dark preference */
export const ADMIN_THEME_STORAGE_KEY = 'smoky-admin-theme' as const;

/** Outer wrapper for most admin pages (under AdminThemeProvider `.dark` ancestor) */
export const ADMIN_PAGE_SHELL_CLASS = 'min-h-screen bg-gray-50 py-8' as const;

/** Fixed desktop sidebar pinned to the viewport's left edge */
export const ADMIN_FIXED_SIDEBAR_CLASS =
  'fixed inset-y-0 left-0 z-30 hidden w-64 lg:block' as const;

/** Keeps desktop content from sliding underneath the fixed sidebar */
export const ADMIN_FIXED_SIDEBAR_SPACER_CLASS = 'hidden w-64 flex-shrink-0 lg:block' as const;

/** Full-screen centered loading state */
export const ADMIN_CENTERED_LOADING_CLASS =
  'min-h-screen flex items-center justify-center' as const;
