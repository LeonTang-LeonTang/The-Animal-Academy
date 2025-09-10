import React from 'react';
import { ConceptExplanation } from '../services/geminiService';
import Feedback from './Feedback';
import { AcademyIcon } from './icons/AcademyIcon';
import { useLocalization } from '../hooks/useLocalization';

interface PlaygroundProps {
  lessons: ConceptExplanation[];
  onSelect: (lesson: ConceptExplanation) => void;
  onRatingUpdate: (lessonId: string, newCounts: { likes: number; dislikes: number }) => void;
}

const Playground: React.FC<PlaygroundProps> = ({ lessons, onSelect, onRatingUpdate }) => {
  const { t } = useLocalization();
  if (lessons.length === 0) {
    return (
      <div className="text-center text-slate-500 p-8 bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-amber-200">
        <AcademyIcon className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-amber-800 mb-2">{t('playgroundEmptyTitle')}</h2>
        <p className="text-lg">{t('playgroundEmptyMessage')}</p>
      </div>
    );
  }

  // Sort lessons by likes (most liked first)
  const sortedLessons = [...lessons].sort((a, b) => b.likes - a.likes);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {sortedLessons.map((lesson) => (
        <div key={lesson.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-amber-200 flex flex-col">
          <div 
            className="p-6 flex-grow cursor-pointer hover:bg-amber-50/50 transition-colors"
            onClick={() => onSelect(lesson)}
          >
            <h3 className="text-2xl font-bold text-amber-800 mb-2">{lesson.mindMap.title}</h3>
            <p className="text-slate-600 font-sans text-sm line-clamp-3">
              {lesson.explanation.substring(0, 150)}...
            </p>
          </div>
          <div className="p-4 bg-amber-50/30 border-t border-amber-200 font-sans">
            <Feedback 
              mode="simple"
              lessonId={lesson.id}
              initialLikes={lesson.likes}
              initialDislikes={lesson.dislikes}
              onRatingUpdate={onRatingUpdate}
            />
          </div>
        </div>
      ))}
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
       `}</style>
    </div>
  );
};

export default Playground;