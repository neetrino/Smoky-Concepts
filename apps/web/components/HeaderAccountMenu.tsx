'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '../lib/auth/AuthContext';

function HeaderAccountIcon() {
  return (
    <svg
      width={31}
      height={21}
      viewBox="0 0 31 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 text-[#dcc090]"
      aria-hidden
    >
      <path
        d="M18.5246 19.9905H3.48936C1.98633 19.9905 0.826316 18.9132 1.02332 17.4977L1.13732 16.6721C1.34432 15.5321 2.44234 14.8149 3.63436 14.5689L10.9295 13.35H11.0735L18.3686 14.5689C19.5806 14.8349 20.6586 15.5122 20.8656 16.6721L20.9796 17.5082C21.1766 18.9237 20.0166 20 18.5136 20L18.5246 19.9905ZM16.0015 5.75C16.0015 7.00978 15.4747 8.21796 14.5371 9.10876C13.5994 9.99955 12.3276 10.5 11.0015 10.5C9.67536 10.5 8.40357 9.99955 7.46588 9.10876C6.52818 8.21796 6.00139 7.00978 6.00139 5.75C6.00139 4.49022 6.52818 3.28204 7.46588 2.39124C8.40357 1.50044 9.67536 1 11.0015 1C12.3276 1 13.5994 1.50044 14.5371 2.39124C15.4747 3.28204 16.0015 4.49022 16.0015 5.75Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30.0015 10L19.0015 10M30.0015 10L25.2872 15M30.0015 10L25.2872 5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const menuClass =
  'block w-full px-3 py-2.5 text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[#dcc090] transition-opacity hover:bg-white/5 hover:opacity-100';

/**
 * Desktop: account icon opens a small menu (profile, admin if applicable, logout).
 * Guest: icon links to login.
 */
export function HeaderDesktopAccount() {
  const pathname = usePathname();
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const iconButtonClass =
    'inline-flex items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc090]';

  if (!isLoggedIn) {
    return (
      <Link href="/login" className={iconButtonClass} aria-label="Sign in">
        <HeaderAccountIcon />
      </Link>
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className={iconButtonClass}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <HeaderAccountIcon />
      </button>
      {open ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full z-[100] mt-2 min-w-[13.5rem] rounded-md border border-[#dcc090]/35 bg-[#122a26] py-1 shadow-lg"
        >
          <Link href="/profile" role="menuitem" className={menuClass} onClick={() => setOpen(false)}>
            Profile
          </Link>
          {isAdmin ? (
            <Link href="/admin" role="menuitem" className={menuClass} onClick={() => setOpen(false)}>
              Admin
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className={`${menuClass} border-t border-white/10 font-extrabold`}
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

type MobileProps = {
  onNavigate?: () => void;
};

/** Mobile drawer: same links as the desktop menu */
export function HeaderMobileAccountLinks({ onNavigate }: MobileProps) {
  const { isLoggedIn, isAdmin, logout } = useAuth();

  const close = () => onNavigate?.();

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        onClick={close}
        className="border-b border-white/10 py-3.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#dcc090]/80 transition-opacity hover:text-[#dcc090]"
      >
        Sign in
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/profile"
        onClick={close}
        className="border-b border-white/10 py-3.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#dcc090]/80 transition-opacity hover:text-[#dcc090]"
      >
        Profile
      </Link>
      {isAdmin ? (
        <Link
          href="/admin"
          onClick={close}
          className="border-b border-white/10 py-3.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#dcc090]/80 transition-opacity hover:text-[#dcc090]"
        >
          Admin
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => {
          close();
          logout();
        }}
        className="w-full border-b border-white/10 py-3.5 text-left text-xs font-extrabold uppercase tracking-[0.16em] text-[#dcc090]/80 transition-opacity hover:text-[#dcc090]"
      >
        Log out
      </button>
    </>
  );
}
