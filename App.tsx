import React, { useState, useEffect } from 'react';
import AcademyExplainer from './components/AcademyExplainer';
import Playground from './components/Playground';
import Header from './components/Header';
import SettingsBar from './components/SettingsBar';
import { ConceptExplanation } from './services/geminiService';
import { AcademyIcon } from './components/icons/AcademyIcon';
import { LocalizationProvider, useLocalization, Language } from './hooks/useLocalization';

export type Theme = 'amber' | 'cool' | 'forest' | 'rose';

const MainApp: React.FC = () => {
  const [view, setView] = useState<'academy' | 'playground'>('academy');
  const [sharedLessons, setSharedLessons] = useState<ConceptExplanation[]>([]);
  const [activeLesson, setActiveLesson] = useState<ConceptExplanation | null>(null);
  const [theme, setTheme] = useState<Theme>('amber');
  
  const { language, setLanguage, t } = useLocalization();

  useEffect(() => {
    document.body.className = ''; // Clear previous theme classes
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.lang = language;
  }, [theme, language]);

  const handleShare = (lesson: ConceptExplanation) => {
    if (sharedLessons.find(l => l.id === lesson.id)) {
        setView('playground');
        return;
    }
    setSharedLessons(prev => [lesson, ...prev]);
    setView('playground');
  };

  const handleSelectLesson = (lesson: ConceptExplanation) => {
    setActiveLesson(lesson);
    setView('academy');
  };

  const handleSetView = (newView: 'academy' | 'playground') => {
    if (newView === 'academy') {
      setActiveLesson(null);
    }
    setView(newView);
  }

  const handleRatingUpdate = (lessonId: string, newCounts: { likes: number; dislikes: number }) => {
    setSharedLessons(prevLessons =>
      prevLessons.map(lesson =>
        lesson.id === lessonId ? { ...lesson, ...newCounts } : lesson
      )
    );
  };

  return (
    <div className="min-h-screen font-gaegu text-slate-800 flex flex-col items-center p-4 bg-amber-50">
      <main className="container mx-auto max-w-3xl w-full relative">
        <SettingsBar 
          theme={theme}
          onSetTheme={setTheme}
          language={language}
          onSetLanguage={setLanguage}
        />
        <header className="text-center mb-8 pt-12 md:pt-4">
          <div className="flex justify-center items-center gap-4">
            <AcademyIcon className="h-16 w-16 text-amber-600" />
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-amber-800">{t('title')}</h1>
              <p className="text-xl text-slate-600 mt-2">{t('tagline')}</p>
            </div>
          </div>
        </header>
        
        <Header activeView={view} setView={handleSetView} />

        {view === 'academy' && (
          <AcademyExplainer 
            key={activeLesson?.id || 'new'} 
            onShare={handleShare} 
            initialLesson={activeLesson}
            language={language}
          />
        )}
        {view === 'playground' && (
          <Playground lessons={sharedLessons} onSelect={handleSelectLesson} onRatingUpdate={handleRatingUpdate} />
        )}

      </main>
      <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>{t('footer')}</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <LocalizationProvider>
    <MainApp />
  </LocalizationProvider>
);


export default App;