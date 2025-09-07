import React, { useState, useRef } from 'react';
import Flashcard from './Flashcard';
import MindMapDisplay from './MindMapDisplay';
import Feedback from './Feedback';
import { ConceptExplanation } from '../services/geminiService';

declare const html2pdf: any;

// FIX: Renamed 'panels' prop to 'comicPanels' to match the ConceptExplanation interface.
const LessonDisplay: React.FC<ConceptExplanation> = ({ quote, explanation, recommendedReading, comicPanels, flashcards, mindMap, sourceFileName }) => {
  const [isEditable, setIsEditable] = useState(false);
  const lessonContentRef = useRef<HTMLDivElement>(null);

  if (!explanation && (!comicPanels || comicPanels.length === 0)) {
    return null;
  }

  const handlePdfExport = () => {
      if (lessonContentRef.current) {
          const opt = {
              margin:       0.5,
              filename:     'animal-academy-lesson.pdf',
              image:        { type: 'jpeg', quality: 0.98 },
              html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
              jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          html2pdf().from(lessonContentRef.current).set(opt).save();
      }
  };

  const handleWordExport = () => {
      if (lessonContentRef.current) {
          const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
              "xmlns:w='urn:schemas-microsoft-com:office:word' "+
              "xmlns='http://www.w3.org/TR/REC-html40'>"+
              "<head><meta charset='utf-8'><title>Export HTML to Word Document</title></head><body>";
          const footer = "</body></html>";
          const sourceHTML = header + lessonContentRef.current.innerHTML + footer;
          const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
          const fileDownload = document.createElement("a");
          document.body.appendChild(fileDownload);
          fileDownload.href = source;
          fileDownload.download = 'animal-academy-lesson.doc';
          fileDownload.click();
          document.body.removeChild(fileDownload);
      }
  };

  const formattedExplanationWithLinks = explanation.replace(
    /\[(.*?)\]\((.*?)\)/g, 
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-600 font-bold hover:underline">$1</a>'
  );
  const formattedExplanation = formattedExplanationWithLinks.replace(
    /\*\*(.*?)\*\*/g, 
    '<strong class="font-bold text-amber-800">$1</strong>'
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
            <h2 className="text-3xl font-bold text-amber-800 mb-4">Explanation</h2>
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
                <h2 className="text-3xl font-bold text-amber-800 mb-4">Recommended Reading</h2>
                <ul className="list-disc list-inside space-y-2 font-sans text-slate-700" contentEditable={isEditable} suppressContentEditableWarning={true}>
                    {recommendedReading.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
        )}

        {/* Source File Section */}
        {sourceFileName && (
          <div className="bg-green-50 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-green-200">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Source</h2>
            <p className="font-sans text-green-700">This lesson was created using the uploaded document: <strong>{sourceFileName}</strong></p>
          </div>
        )}

        {/* Comic Strip Section */}
        {comicPanels && comicPanels.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-amber-800 text-center mb-4">Comic Illustration</h2>
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
            <h2 className="text-3xl font-bold text-amber-800 text-center mb-6">Flashcards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map((card, index) => <Flashcard key={index} term={card.term} definition={card.definition} isEditable={isEditable} />)}
            </div>
          </div>
        )}

        {/* Mind Map Section */}
        {mindMap && (
          <div>
              <h2 className="text-3xl font-bold text-amber-800 text-center mb-6">Mind Map</h2>
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
        <h3 className="text-2xl font-bold text-amber-800">Customize & Share</h3>
        <p className="text-slate-600">You can edit the text above, and save your custom lesson as a PDF or Word document.</p>
        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <button onClick={() => setIsEditable(!isEditable)} className={`px-6 py-2 font-bold rounded-full transition-colors ${isEditable ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-800 hover:bg-amber-300'}`}>
            {isEditable ? 'Lock Edits' : 'Enable Editing'}
          </button>
          <button onClick={handlePdfExport} className="px-6 py-2 font-bold rounded-full bg-amber-200 text-amber-800 hover:bg-amber-300 transition-colors">Export as PDF</button>
          <button onClick={handleWordExport} className="px-6 py-2 font-bold rounded-full bg-amber-200 text-amber-800 hover:bg-amber-300 transition-colors">Export as Word</button>
          <button disabled className="px-6 py-2 font-bold rounded-full bg-slate-300 text-slate-500 cursor-not-allowed" title="Feature coming soon!">Share to Playground</button>
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
      `}</style>
    </div>
  );
};

export default LessonDisplay;