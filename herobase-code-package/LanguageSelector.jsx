/*
 * HEROBASE.IO & VICFOUNDATION.COM — Language Selector Dropdown
 * Multilingual support with 10+ languages
 * Stores preference in localStorage
 * Works with react-i18next (or can be adapted for any i18n framework)
 *
 * Usage:
 *   <LanguageSelector />
 *
 * Integration with react-i18next:
 *   import { useTranslation } from 'react-i18next';
 *   const { i18n } = useTranslation();
 *   // Pass i18n.changeLanguage as the onChange handler
 */
import { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tl', label: 'Filipino', flag: '🇵🇭' },
];

const STORAGE_KEY = 'preferred_language';

export default function LanguageSelector({ onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return LANGUAGES.find(l => l.code === stored) || LANGUAGES[0];
  });
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (lang) => {
    setSelected(lang);
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, lang.code);
    if (onChange) onChange(lang.code);
    // If using react-i18next: i18n.changeLanguage(lang.code);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/20 hover:bg-black/30
                   border border-white/10 text-white text-xs font-medium
                   transition-all rounded-sm"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span>{selected.flag}</span>
        <span className="hidden sm:inline">{selected.label}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-gray-900 border border-white/10
                        shadow-xl z-50 max-h-64 overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm
                         transition-colors hover:bg-white/10
                         ${selected.code === lang.code
                           ? 'text-yellow-400 bg-white/5'
                           : 'text-white/80'
                         }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
              {selected.code === lang.code && (
                <svg className="w-4 h-4 ml-auto text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
