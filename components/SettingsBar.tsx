import React, { useState, useRef } from 'react';
import { ThemeIcon } from './icons/ThemeIcon';
import { LanguageIcon } from './icons/LanguageIcon';
import { useOutsideClick, Language } from '../hooks/useLocalization';
import { Theme } from '../App';

interface SettingsBarProps {
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
  language: Language;
  onSetLanguage: (language: Language) => void;
}

const themes: { name: Theme; color: string }[] = [
  { name: 'amber', color: 'bg-amber-500' },
  { name: 'cool', color: 'bg-sky-500' },
  { name: 'forest', color: 'bg-emerald-500' },
  { name: 'rose', color: 'bg-rose-500' },
];

const languages: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
];

const SettingsBar: React.FC<SettingsBarProps> = ({ theme, onSetTheme, language, onSetLanguage }) => {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const themeMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(themeMenuRef, () => setThemeMenuOpen(false));
  useOutsideClick(langMenuRef, () => setLangMenuOpen(false));

  const handleThemeSelect = (selectedTheme: Theme) => {
    onSetTheme(selectedTheme);
    setThemeMenuOpen(false);
  };

  const handleLangSelect = (selectedLang: Language) => {
    onSetLanguage(selectedLang);
    setLangMenuOpen(false);
  };

  const menuAnimationClasses = "transition-all duration-100 ease-out";

  return (
    <div className="absolute top-0 right-0 flex gap-2 p-2 z-10">
      {/* Theme Selector */}
      <div className="relative" ref={themeMenuRef}>
        <button
          onClick={() => setThemeMenuOpen(!themeMenuOpen)}
          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-100 rounded-full transition-colors"
          aria-label="Select theme"
          title="Select Theme"
        >
          <ThemeIcon className="w-6 h-6" />
        </button>
        <div className={`absolute top-full right-0 mt-2 w-40 origin-top-right ${menuAnimationClasses} ${themeMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <ul className="bg-white rounded-lg shadow-lg border border-slate-200 py-1">
            {themes.map((t) => (
              <li key={t.name}>
                <button
                  onClick={() => handleThemeSelect(t.name)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                    theme === t.name
                      ? 'font-bold text-amber-800 bg-amber-100'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${t.color}`}></span>
                  <span className="capitalize">{t.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Language Selector */}
      <div className="relative" ref={langMenuRef}>
        <button
          onClick={() => setLangMenuOpen(!langMenuOpen)}
          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-100 rounded-full transition-colors"
          aria-label="Select language"
          title="Select Language"
        >
          <LanguageIcon className="w-6 h-6" />
        </button>
        <div className={`absolute top-full right-0 mt-2 w-40 origin-top-right ${menuAnimationClasses} ${langMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <ul className="bg-white rounded-lg shadow-lg border border-slate-200 py-1">
            {languages.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => handleLangSelect(l.code)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    language === l.code
                      ? 'font-bold text-amber-800 bg-amber-100'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {l.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SettingsBar;
