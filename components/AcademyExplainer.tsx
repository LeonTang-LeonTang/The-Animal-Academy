import React, { useState, useCallback } from 'react';
import { generateAcademyLesson, ConceptExplanation } from '../services/geminiService';
import LessonDisplay from './StoryDisplay';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';

const AcademyExplainer: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for the lesson and uploaded file
  const [lesson, setLesson] = useState<ConceptExplanation | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState<string>('');

  const resetLesson = () => {
    setLesson(null);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        setUploadedFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setDocumentText(e.target?.result as string);
        };
        reader.readAsText(file);
        setError(null);
      } else {
        setError("Please upload a plain text (.txt) file.");
        setUploadedFile(null);
        setDocumentText('');
      }
    }
  };
  
  const clearFile = () => {
    setUploadedFile(null);
    setDocumentText('');
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleGeneration = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please enter a concept for our animals to explain.");
      return;
    }
    setIsLoading(true);
    setError(null);
    resetLesson();

    try {
      const document = uploadedFile ? { name: uploadedFile.name, text: documentText } : undefined;
      const result = await generateAcademyLesson(topic, document);
      setLesson(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [topic, uploadedFile, documentText]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGeneration();
    }
  };
  
  const hasContent = lesson !== null;

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

       <div className="mt-4 text-center">
          <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt" disabled={isLoading} />
          {uploadedFile ? (
              <div className="inline-flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  <span className="text-sm text-slate-700">Using: {uploadedFile.name}</span>
                  <button onClick={clearFile} disabled={isLoading} className="text-amber-600 hover:text-amber-800 font-bold text-lg leading-none align-middle" aria-label="Remove file">&times;</button>
              </div>
          ) : (
              <label htmlFor="file-upload" className="text-sm text-slate-600 cursor-pointer inline-flex items-center bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full border border-amber-200 transition-colors">
                  Optional: Upload a document (.txt) for a focused explanation
              </label>
          )}
      </div>

      <div className="mt-8 min-h-[200px] flex items-center justify-center">
        {isLoading && <Loader />}
        {error && !isLoading && <ErrorDisplay message={error} />}
        {hasContent && !isLoading && (
          <LessonDisplay {...lesson!} />
        )}
        {!isLoading && !error && !hasContent && (
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