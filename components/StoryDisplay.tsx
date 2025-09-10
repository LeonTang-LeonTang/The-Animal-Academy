import React, { useState, useRef } from 'react';
import Flashcard from './Flashcard';
import MindMapDisplay from './MindMapDisplay';
import Feedback from './Feedback';
import AudioPlayer from './AudioPlayer';
import { ConceptExplanation } from '../services/geminiService';
import { useLocalization } from '../hooks/useLocalization';

// This type omits properties that are not directly used for display
// and adds the `topic` needed for the export functionality.
interface LessonDisplayProps extends Omit<ConceptExplanation, 'id' | 'likes' | 'dislikes'> {
  topic: string;
  onShare?: () => void;
}

const LessonDisplay: React.FC<LessonDisplayProps> = ({ topic, quote, explanation, recommendedReading, comicPanels, flashcards, mindMap, sourceFileName, onShare }) => {
  const [isEditable, setIsEditable] = useState(false);
  const lessonContentRef = useRef<HTMLDivElement>(null);
  const { t } = useLocalization();

  if (!explanation && (!comicPanels || comicPanels.length === 0)) {
    return null;
  }

  const handleWordExport = () => {
      const contentNode = lessonContentRef.current;
      if (contentNode) {
          const clonedNode = contentNode.cloneNode(true) as HTMLElement;

          // Remove mind map chevrons from the clone for a cleaner export
          clonedNode.querySelectorAll('.mind-map-chevron').forEach(el => el.remove());
          // Make source quotes look like normal text in export
          clonedNode.querySelectorAll('.source-quote').forEach(el => {
            el.className = '';
            el.removeAttribute('style');
          });

          const titleHtml = `<h1 style="font-size: 24pt; font-family: 'Times New Roman', serif;">${topic}</h1>`;
          const contentHtml = clonedNode.innerHTML;

          const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
              "xmlns:w='urn:schemas-microsoft-com:office:word' "+
              "xmlns='http://www.w3.org/TR/REC-html40'>"+
              "<head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>";
          const footer = "</body></html>";
          
          const sourceHTML = header + titleHtml + contentHtml + footer;
          const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
          const fileDownload = document.createElement("a");
          document.body.appendChild(fileDownload);
          fileDownload.href = source;
          fileDownload.download = `animal-academy-${topic.replace(/\s+/g, '-')}.doc`;
          fileDownload.click();
          document.body.removeChild(fileDownload);
      }
  };


  const formattedExplanation = explanation
    .replace(/\[(.*?)\]\((.*?)\)/g, 
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-600 font-bold hover:underline">$1</a>'
    )
    .replace(/\*\*(.*?)\*\*/g, 
      '<strong class="font-bold text-amber-800">$1</strong>'
    )
    .replace(/^> (.*$)/gm, 
      '<blockquote class="source-quote">$1</blockquote>'
    );


  return (
    <div className="w-full space-y-12 animate-fade-in">
      <div ref={lessonContentRef} className="space-y-12">
        {/* Quote Section */}
        {quote && (
          <div className="text-center border-l-4 border-amber-400 pl-6">
            <blockquote className="text-2xl italic text-slate-700">"{quote.text}"</blockquote>
            <cite className="block text-right mt-2 text-slate-500 not-italic">— {quote.author}</cite>
          </div>
        )}

        {/* Explanation Section */}
        {explanation && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-amber-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-amber-800">{t('explanationTitle')}</h2>
              <AudioPlayer text={explanation} />
            </div>
            <div 
              className="text-slate-700 whitespace-pre-wrap font-sans text-base leading-relaxed"
              contentEditable={isEditable}
              dangerouslySetInnerHTML={{ __html: formattedExplanation }}
              suppressContentEditableWarning={true}
            />
          </div>
        )}
        
        {/* Recommended Reading Section */}
        {recommendedReading && recommendedReading.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-amber-200">
                <h2 className="text-3xl font-bold text-amber-800 mb-4">{t('readingTitle')}</h2>
                <ul className="list-disc list-inside space-y-2 font-sans text-slate-700" contentEditable={isEditable} suppressContentEditableWarning={true}>
                    {recommendedReading.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
        )}

        {/* Source File Section */}
        {sourceFileName && (
          <div className="bg-green-50 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-green-200">
            <h2 className="text-3xl font-bold text-green-800 mb-4">{t('sourceTitle')}</h2>
            <p className="font-sans text-green-700">{t('sourceText')} <strong>{sourceFileName}</strong></p>
          </div>
        )}

        {/* Comic Strip Section */}
        {comicPanels && comicPanels.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-amber-800 text-center mb-4">{t('comicTitle')}</h2>
            {comicPanels.map((panel, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden border border-amber-200" style={{ animationDelay: `${index * 150}ms` }}>
                <img src={panel.imageUrl} alt={`Comic panel ${index + 1} illustrating the concept.`} className="w-full h-auto object-cover aspect-square" />
                <div className="p-4 bg-amber-50/70">
                  <p className="text-slate-700 font-gaegu text-center" style={{fontSize: '1.5rem', lineHeight: '1.7'}} contentEditable={isEditable} suppressContentEditableWarning={true}>
                    {panel.narrative}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Flashcards Section */}
        {flashcards && flashcards.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-amber-800 text-center mb-6">{t('flashcardsTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map((card, index) => <Flashcard key={index} term={card.term} definition={card.definition} isEditable={isEditable} />)}
            </div>
          </div>
        )}

        {/* Mind Map Section */}
        {mindMap && (
          <div>
              <h2 className="text-3xl font-bold text-amber-800 text-center mb-6">{t('mindMapTitle')}</h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-amber-200 font-sans">
                  <MindMapDisplay node={mindMap} isEditable={isEditable} />
              </div>
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <Feedback />

      {/* Actions Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-amber-200 mt-12 space-y-4 text-center">
        <h3 className="text-2xl font-bold text-amber-800">{t('actionsTitle')}</h3>
        <p className="text-slate-600">{t('actionsText')}</p>
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <button onClick={() => setIsEditable(!isEditable)} className={`px-6 py-2 font-bold rounded-full transition-colors ${isEditable ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-800 hover:bg-amber-300'}`}>
            {isEditable ? t('lockEditsButton') : t('enableEditingButton')}
          </button>
          <button onClick={handleWordExport} className="px-6 py-2 font-bold rounded-full bg-amber-200 text-amber-800 hover:bg-amber-300 transition-colors">{t('exportWordButton')}</button>
          <button onClick={onShare} disabled={!onShare} className="px-6 py-2 font-bold rounded-full bg-sky-200 text-sky-800 hover:bg-sky-300 transition-colors disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed">{t('sharePlaygroundButton')}</button>
        </div>
      </div>


      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        [contenteditable="true"] {
          outline: 2px dashed #fbbf24;
          border-radius: 4px;
          padding: 2px;
        }
        .source-quote {
          background-color: #fefce8; /* yellow-50 */
          border-left: 4px solid #facc15; /* yellow-400 */
          padding: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #44403c; /* stone-700 */
          border-radius: 0 8px 8px 0;
        }
        
        .theme-cool [contenteditable="true"] { outline-color: #38bdf8; }
        .theme-forest [contenteditable="true"] { outline-color: #34d399; }
        .theme-rose [contenteditable="true"] { outline-color: #fb7185; }

        .theme-cool .source-quote {
          background-color: #eff6ff; /* blue-50 */
          border-left-color: #60a5fa; /* blue-400 */
        }
        .theme-forest .source-quote {
          background-color: #f0fdf4; /* green-50 */
          border-left-color: #4ade80; /* green-400 */
        }
        .theme-rose .source-quote {
          background-color: #fff1f2; /* rose-50 */
          border-left-color: #fb7185; /* rose-400 */
        }
      `}</style>
    </div>
  );
};

export default LessonDisplay;