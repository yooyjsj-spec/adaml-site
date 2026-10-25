import React, { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import type { Locale } from '../i18n/messages';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, m } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = (next: Locale) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={m.lang.change}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-200"
      >
        <Globe size={18} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={m.lang.change}
          className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
        >
          {([
            { id: 'en' as const, label: m.lang.english },
            { id: 'ko' as const, label: m.lang.korean },
          ]).map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={locale === option.id}
              onClick={() => choose(option.id)}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                locale === option.id
                  ? 'bg-primary-50 font-semibold text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {option.label}
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {option.id}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
