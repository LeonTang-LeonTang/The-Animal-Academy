import React from 'react';
import AcademyExplainer from './components/AcademyExplainer';
import { AcademyIcon } from './components/icons/AcademyIcon';

const App: React.FC = () => {
  return (
    <div className="min-h-screen font-gaegu text-slate-800 flex flex-col items-center justify-center p-4">
      <main className="container mx-auto max-w-3xl w-full">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <AcademyIcon className="h-16 w-16 text-amber-600" />
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-amber-800">The Animal Academy</h1>
              <p className="text-xl text-slate-600 mt-2">Let our animal teachers explain any concept with a custom comic!</p>
            </div>
          </div>
        </header>
        <AcademyExplainer />
      </main>
      <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>Education, illustrated by nature's finest.</p>
      </footer>
    </div>
  );
};

export default App;