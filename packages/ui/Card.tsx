'use client';

import React, { HTMLAttributes, forwardRef, ReactElement } from 'react';

export type CardVariant = 'default' | 'glass';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Frosted panel for policy/legal surfaces on tinted page backgrounds. */
  variant?: CardVariant;
}

const variantSurface: Record<CardVariant, string> = {
  default: 'rounded-2xl border border-gray-200 bg-white shadow-sm',
  glass:
    'rounded-3xl border border-slate-300/55 bg-[linear-gradient(158deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0.82)_10%,rgba(248,250,252,0.38)_38%,rgba(203,213,225,0.78)_68%,rgba(148,163,184,0.58)_88%,rgba(100,116,139,0.38)_100%)] shadow-[0_14px_52px_-16px_rgba(15,23,42,0.18),inset_0_1px_0_0_rgba(255,255,255,0.88)] backdrop-blur-2xl backdrop-saturate-200 ring-1 ring-inset ring-white/75',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card({ className = '', children, variant = 'default', ...props }, ref): ReactElement {
    return (
      <div
        ref={ref}
        className={`${variantSurface[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

