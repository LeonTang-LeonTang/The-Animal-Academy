import React, { useState, useCallback } from 'react';
import { generateAcademyLesson, ComicPanelData } from '../services/geminiService';
import StoryDisplay from './StoryDisplay';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';

const AcademyExplainer: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [comicPanels, setComicPanels] = useState<ComicPanelData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneration = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please enter a concept for our animals to explain.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setComicPanels([]);
    setExplanation('');

    try {
      const result = await generateAcademyLesson(topic);
      setExplanation(result.explanation);
      setComicPanels(result.comicPanels);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGeneration();
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-lg border border-amber-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask our teachers... (e.g., 'Photosynthesis')"
          className="flex-grow w-full px-5 py-3 text-lg bg-amber-50 border-2 border-amber-300 rounded-full focus:ring-4 focus:ring-amber-300 focus:border-amber-500 focus:outline-none transition duration-300 placeholder-slate-500"
          disabled={isLoading}
        />
        <button
          onClick={handleGeneration}
          disabled={isLoading || !topic.trim()}
          className="px-8 py-3 bg-amber-600 text-white text-lg font-bold rounded-full shadow-md hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition duration-300"
        >
          {isLoading ? 'Thinking...' : 'Explain'}
        </button>
      </div>

      <div className="mt-8 min-h-[200px] flex items-center justify-center">
        {isLoading && <Loader />}
        {error && !isLoading && <ErrorDisplay message={error} />}
        {(explanation || comicPanels.length > 0) && !isLoading && (
          <StoryDisplay explanation={explanation} panels={comicPanels} />
        )}
        {!isLoading && !error && !explanation && comicPanels.length === 0 && (
          <div className="text-center text-slate-500">
            <p className="text-xl">Welcome to the Animal Academy! 🐾</p>
            <p className="mt-2">What would you like to learn about today? Our expert animal faculty is ready to help.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademyExplainer;
