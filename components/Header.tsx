import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface HeaderProps {
  activeView: 'academy' | 'playground';
  setView: (view: 'academy' | 'playground') => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setView }) => {
  const { t } = useLocalization();
  const baseClasses = "px-6 py-2 font-bold rounded-full transition-colors text-lg";
  const activeClasses = "bg-amber-600 text-white shadow-md";
  const inactiveClasses = "bg-amber-100 text-amber-800 hover:bg-amber-200";

  return (
    <nav className="flex justify-center gap-4 my-6">
      <button
        onClick={() => setView('academy')}
        className={`${baseClasses} ${activeView === 'academy' ? activeClasses : inactiveClasses}`}
        aria-current={activeView === 'academy'}
      >
        {t('headerAcademy')}
      </button>
      <button
        onClick={() => setView('playground')}
        className={`${baseClasses} ${activeView === 'playground' ? activeClasses : inactiveClasses}`}
        aria-current={activeView === 'playground'}
      >
        {t('headerPlayground')}
      </button>
    </nav>
  );
};

export default Header;