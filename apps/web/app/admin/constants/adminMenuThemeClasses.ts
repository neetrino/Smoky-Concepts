import type { AdminTheme } from '@/app/admin/types/admin-theme.types';

/** Desktop sidebar nav container */
export function adminNavContainerClass(theme: AdminTheme): string {
  const base = 'h-full overflow-y-auto border-r p-3 space-y-1';
  return theme === 'dark'
    ? `${base} bg-[#122a26] border-[#dcc090]/20`
    : `${base} bg-[#122a26] border-[#dcc090]/25`;
}

export function adminNavItemActiveClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'bg-[#dcc090] text-[#122a26]'
    : 'bg-[#dcc090] text-[#122a26]';
}

export function adminNavItemInactiveClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'text-[#dcc090]/75 hover:bg-white/5 hover:text-[#dcc090]'
    : 'text-[#dcc090]/75 hover:bg-white/5 hover:text-[#dcc090]';
}

export function adminNavIconClass(isActive: boolean, theme: AdminTheme): string {
  const base = 'flex-shrink-0';
  if (isActive) {
    return `${base} ${theme === 'dark' ? 'text-[#122a26]' : 'text-[#122a26]'}`;
  }
  return `${base} ${theme === 'dark' ? 'text-[#dcc090]/65' : 'text-[#dcc090]/65'}`;
}

export function adminNavDividerClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'pt-2 mt-1 border-t border-[#dcc090]/20'
    : 'pt-2 mt-1 border-t border-[#dcc090]/20';
}

/** Mobile menu trigger */
export function adminDrawerTriggerClass(theme: AdminTheme): string {
  const base =
    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-wide shadow-sm';
  return theme === 'dark'
    ? `${base} border-[#dcc090]/35 bg-[#122a26] text-[#dcc090]`
    : `${base} border-[#dcc090]/35 bg-[#122a26] text-[#dcc090]`;
}

export function adminDrawerPanelClass(theme: AdminTheme): string {
  const base =
    'h-full min-h-screen w-1/2 min-w-[16rem] max-w-full flex flex-col shadow-2xl';
  return theme === 'dark' ? `${base} bg-[#122a26]` : `${base} bg-[#122a26]`;
}

export function adminDrawerHeaderRowClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'flex items-center justify-between gap-2 border-b border-[#dcc090]/20 px-5 py-4'
    : 'flex items-center justify-between gap-2 border-b border-[#dcc090]/20 px-5 py-4';
}

export function adminDrawerTitleClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'text-lg font-semibold text-[#dcc090]'
    : 'text-lg font-semibold text-[#dcc090]';
}

export function adminDrawerCloseButtonClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'h-10 w-10 rounded-full border border-[#dcc090]/30 text-[#dcc090]/75 hover:border-[#dcc090] hover:text-[#dcc090]'
    : 'h-10 w-10 rounded-full border border-[#dcc090]/30 text-[#dcc090]/75 hover:border-[#dcc090] hover:text-[#dcc090]';
}

export function adminDrawerListClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'flex-1 overflow-y-auto divide-y divide-[#dcc090]/10'
    : 'flex-1 overflow-y-auto divide-y divide-[#dcc090]/10';
}

export function adminDrawerRowActiveClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'bg-[#dcc090] text-[#122a26]'
    : 'bg-[#dcc090] text-[#122a26]';
}

export function adminDrawerRowInactiveClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'text-[#dcc090]/75 hover:bg-white/5'
    : 'text-[#dcc090]/75 hover:bg-white/5';
}

export function adminDrawerRowIconClass(isActive: boolean, theme: AdminTheme): string {
  if (isActive) {
    return theme === 'dark' ? 'text-[#122a26]' : 'text-[#122a26]';
  }
  return theme === 'dark' ? 'text-[#dcc090]/65' : 'text-[#dcc090]/65';
}

export function adminDrawerChevronClass(isActive: boolean, theme: AdminTheme): string {
  const base = 'w-4 h-4';
  if (isActive) {
    return `${base} ${theme === 'dark' ? 'text-[#122a26]' : 'text-[#122a26]'}`;
  }
  return `${base} ${theme === 'dark' ? 'text-[#dcc090]/50' : 'text-[#dcc090]/50'}`;
}

export function adminThemeToggleButtonSidebarClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'w-full border border-[#dcc090]/30 bg-white/5 px-3 py-2.5 text-[#dcc090] hover:bg-white/10'
    : 'w-full border border-[#dcc090]/30 bg-white/5 px-3 py-2.5 text-[#dcc090] hover:bg-white/10';
}

export function adminThemeToggleButtonDrawerClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'h-10 w-10 border border-[#dcc090]/30 bg-white/5 text-[#dcc090] hover:bg-white/10'
    : 'h-10 w-10 border border-[#dcc090]/30 bg-white/5 text-[#dcc090] hover:bg-white/10';
}

export function adminThemeToggleFocusRingClass(theme: AdminTheme): string {
  return theme === 'dark'
    ? 'focus-visible:outline-[#dcc090]'
    : 'focus-visible:outline-[#dcc090]';
}
