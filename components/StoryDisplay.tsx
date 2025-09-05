import React from 'react';

interface ComicPanelData {
  narrative: string;
  imageUrl: string;
}

interface StoryDisplayProps {
  explanation: string;
  panels: ComicPanelData[];
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ explanation, panels }) => {
  if (!explanation && (!panels || panels.length === 0)) {
    return null;
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Explanation Section */}
      {explanation && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-amber-200">
          <h2 className="text-3xl font-bold text-amber-800 mb-4">Explanation</h2>
          <p className="text-slate-700 whitespace-pre-wrap font-sans text-base leading-relaxed">
            {explanation}
          </p>
        </div>
      )}

      {/* Comic Strip Section */}
      {panels && panels.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-amber-800 text-center mb-4">Comic Illustration</h2>
          {panels.map((panel, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md overflow-hidden border border-amber-200" style={{ animationDelay: `${index * 150}ms` }}>
              <img src={panel.imageUrl} alt={`Comic panel ${index + 1} illustrating the concept.`} className="w-full h-auto object-cover aspect-square" />
              <div className="p-4 bg-amber-50/70">
                <p className="text-slate-700 font-gaegu text-center" style={{fontSize: '1.5rem', lineHeight: '1.7'}}>
                  {panel.narrative}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default StoryDisplay;