'use client';

import { useEffect, useRef, useState } from 'react';

import { CURRENCIES, getStoredCurrency, setStoredCurrency, type CurrencyCode } from '../lib/currency';

const ChevronDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type SwitcherVariant = 'header' | 'drawer';

interface CurrencySwitcherHeaderProps {
  variant?: SwitcherVariant;
}

const CURRENCY_OPTIONS = Object.keys(CURRENCIES) as CurrencyCode[];

export function CurrencySwitcherHeader({ variant = 'header' }: CurrencySwitcherHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('USD');
  const menuRef = useRef<HTMLDivElement>(null);
  const isDrawer = variant === 'drawer';

  useEffect(() => {
    const syncCurrency = () => setCurrentCurrency(getStoredCurrency());
    syncCurrency();
    window.addEventListener('currency-updated', syncCurrency);
    return () => window.removeEventListener('currency-updated', syncCurrency);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeCurrency = (code: CurrencyCode) => {
    if (code === currentCurrency) {
      setShowMenu(false);
      return;
    }
    setStoredCurrency(code);
    setCurrentCurrency(code);
    setShowMenu(false);
  };

  return (
    <div className={isDrawer ? 'relative w-full' : 'relative'} ref={menuRef}>
      <button
        type="button"
        onClick={() => setShowMenu((v) => !v)}
        aria-expanded={showMenu}
        aria-haspopup="listbox"
        className={
          isDrawer
            ? 'flex w-full items-center justify-between border-t border-white/10 py-4 text-left text-[#dcc090] transition-opacity hover:opacity-90'
            : 'flex items-center gap-1.5 rounded-md bg-transparent px-1 py-1.5 text-[#dcc090] transition-opacity hover:opacity-90 sm:gap-2 sm:px-2'
        }
      >
        <span className="text-sm font-extrabold uppercase tracking-[0.16em]">{currentCurrency}</span>
        <span className={showMenu ? 'rotate-180 transition-transform' : 'transition-transform'}>
          <ChevronDownIcon />
        </span>
      </button>

      {showMenu ? (
        <div
          className={
            isDrawer
              ? 'mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#0d1e1b] py-1'
              : 'absolute right-0 top-full z-[60] mt-2 min-w-[10rem] overflow-hidden rounded-lg border border-[#dcc090]/35 bg-[#122a26] py-1 shadow-2xl'
          }
          role="listbox"
        >
          {CURRENCY_OPTIONS.map((code) => {
            const isActive = currentCurrency === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => changeCurrency(code)}
                disabled={isActive}
                className={`flex w-full items-center justify-between border-l-4 px-4 py-2.5 text-left text-xs uppercase tracking-[0.12em] transition-all ${
                  isActive
                    ? 'cursor-default border-[#dcc090]/60 bg-[#dcc090]/15 font-extrabold text-[#dcc090]'
                    : 'cursor-pointer border-transparent font-bold text-[#dcc090]/85 hover:bg-white/5 hover:text-[#dcc090]'
                }`}
              >
                <span>{code}</span>
                <span className="text-[0.75rem] normal-case">{CURRENCIES[code].symbol}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

