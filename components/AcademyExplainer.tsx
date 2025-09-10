import React, { useState, useCallback, useEffect } from 'react';
import { generateAcademyLesson, ConceptExplanation } from '../services/geminiService';
import LessonDisplay from './StoryDisplay';
import Loader from './Loader';
import ErrorDisplay from './ErrorDisplay';
import { useLocalization, Language } from '../hooks/useLocalization';

declare const mammoth: any;
declare const JSZip: any;

interface AcademyExplainerProps {
  initialLesson: ConceptExplanation | null;
  onShare: (lesson: ConceptExplanation) => void;
  language: Language;
}

const AcademyExplainer: React.FC<AcademyExplainerProps> = ({ initialLesson, onShare, language }) => {
  const [topic, setTopic] = useState<string>(initialLesson?.mindMap?.title || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [lesson, setLesson] = useState<ConceptExplanation | null>(initialLesson);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState<string>('');

  const { t } = useLocalization();
  
  useEffect(() => {
    setLesson(initialLesson);
    setTopic(initialLesson?.mindMap?.title || '');
  }, [initialLesson]);


  const resetLesson = () => {
    setLesson(null);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();

      if (file.type === 'text/plain') {
        reader.onload = (e) => setDocumentText(e.target?.result as string);
        reader.readAsText(file);
        setError(null);
      } else if (file.name.endsWith('.docx')) {
        if (typeof mammoth === 'undefined') {
          setError("Word document library (mammoth.js) is not loaded.");
          return;
        }
        reader.onload = (e) => {
          mammoth.extractRawText({ arrayBuffer: e.target?.result })
            .then((result: any) => {
              setDocumentText(result.value);
              setError(null);
            })
            .catch((err: Error) => {
              console.error(err);
              setError(`Error reading .docx file: ${err.message}`);
            });
        };
        reader.readAsArrayBuffer(file);
      } else if (file.name.endsWith('.pptx')) {
        if (typeof JSZip === 'undefined') {
          setError("PowerPoint document library (jszip.js) is not loaded.");
          return;
        }
        reader.onload = (e) => {
          JSZip.loadAsync(e.target.result)
            .then(async (zip: any) => {
              const slidePromises: Promise<string>[] = [];
              zip.folder("ppt/slides").forEach((relativePath: string, file: any) => {
                if (relativePath.startsWith("slide") && relativePath.endsWith(".xml")) {
                  slidePromises.push(file.async("string"));
                }
              });
              const slideXmls = await Promise.all(slidePromises);
              const textContent = slideXmls.map(xml => {
                const textNodes = xml.match(/<a:t>.*?<\/a:t>/g) || [];
                return textNodes.map((node: string) => node.replace(/<a:t>/, '').replace(/<\/a:t>/, '')).join(' ');
              }).join('\\n\\n');
              setDocumentText(textContent);
              setError(null);
            })
            .catch((err: Error) => {
              console.error(err);
              setError(`Error reading .pptx file: ${err.message}`);
            });
        };
        reader.readAsArrayBuffer(file);
      } else {
        setError("Unsupported file. Please upload .txt, .docx, or .pptx.");
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
      setError(t('errorEnterConcept'));
      return;
    }
    setIsLoading(true);
    setError(null);
    resetLesson();

    try {
      const document = uploadedFile ? { name: uploadedFile.name, text: documentText } : undefined;
      const result = await generateAcademyLesson(topic, language, document);
      setLesson(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errorUnexpected');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [topic, uploadedFile, documentText, language, t]);

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
          placeholder={t('explainerPlaceholder')}
          className="flex-grow w-full px-5 py-3 text-lg bg-amber-50 border-2 border-amber-300 rounded-full focus:ring-4 focus:ring-amber-300 focus:border-amber-500 focus:outline-none transition duration-300 placeholder-slate-500"
          disabled={isLoading}
        />
        <button
          onClick={handleGeneration}
          disabled={isLoading || !topic.trim()}
          className="px-8 py-3 bg-amber-600 text-white text-lg font-bold rounded-full shadow-md hover:bg-amber-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition duration-300"
        >
          {isLoading ? t('explainButtonLoading') : t('explainButton')}
        </button>
      </div>

       <div className="mt-4 text-center">
          <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.docx,.pptx" disabled={isLoading} />
          {uploadedFile ? (
              <div className="inline-flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  <span className="text-sm text-slate-700">{t('usingFileLabel')} {uploadedFile.name}</span>
                  <button onClick={clearFile} disabled={isLoading} className="text-amber-600 hover:text-amber-800 font-bold text-lg leading-none align-middle" aria-label="Remove file">&times;</button>
              </div>
          ) : (
              <label htmlFor="file-upload" className={`text-sm text-slate-600 inline-flex items-center bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full border border-amber-200 transition-colors ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  {t('uploadLabel')}
              </label>
          )}
      </div>

      <div className="mt-8 min-h-[200px] flex items-center justify-center">
        {isLoading && <Loader />}
        {error && !isLoading && <ErrorDisplay message={error} />}
        {hasContent && !isLoading && (
          <LessonDisplay {...lesson!} topic={topic} onShare={() => onShare(lesson!)} />
        )}
        {!isLoading && !error && !hasContent && (
          <div className="text-center text-slate-500">
            <p className="text-xl">{t('welcomeTitle')} 🐾</p>
            <p className="mt-2">{t('welcomeMessage')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademyExplainer;