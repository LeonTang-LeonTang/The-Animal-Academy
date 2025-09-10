import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { StopIcon } from './icons/StopIcon';

interface AudioPlayerProps {
  text: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const [playState, setPlayState] = useState<'playing' | 'paused' | 'stopped'>('stopped');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Cleanup function to cancel speech when the component unmounts or text changes
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, [text]);

  const handlePlayPause = () => {
    if (playState === 'playing') {
      speechSynthesis.pause();
      setPlayState('paused');
    } else {
      if (playState === 'paused') {
        speechSynthesis.resume();
      } else { // 'stopped'
        // Clean up text for better speech flow
        const cleanedText = text
          .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Remove markdown link syntax
          .replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown

        const newUtterance = new SpeechSynthesisUtterance(cleanedText);
        utteranceRef.current = newUtterance;
        
        newUtterance.onend = () => {
          setPlayState('stopped');
        };
        newUtterance.onerror = (event) => {
            console.error("Speech synthesis error:", event.error);
            setPlayState('stopped');
        }
        
        speechSynthesis.speak(newUtterance);
      }
      setPlayState('playing');
    }
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setPlayState('stopped');
  };

  return (
    <div className="flex items-center gap-2 bg-amber-100 rounded-full p-1 border border-amber-200">
      <button 
        onClick={handlePlayPause} 
        className="p-2 rounded-full text-amber-700 hover:bg-amber-200 hover:text-amber-900 transition-colors"
        aria-label={playState === 'playing' ? 'Pause' : 'Play'}
      >
        {playState === 'playing' ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
      </button>
      <button 
        onClick={handleStop} 
        className="p-2 rounded-full text-amber-700 hover:bg-amber-200 hover:text-amber-900 transition-colors"
        aria-label="Stop"
        disabled={playState === 'stopped'}
      >
        <StopIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AudioPlayer;