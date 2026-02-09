import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Music } from 'lucide-react';

const NCS_TRACK = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112778.mp3"; 

export const MusicPlayer = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Auto play on mount
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Auto-play was prevented
          setIsPlaying(false);
        });
      }
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-64 transition-all animate-fade-in-up">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Music size={18} className="text-primary animate-pulse" />
          <span className="font-semibold text-sm text-gray-800 dark:text-white">Class Vibes</span>
        </div>
        <button onClick={handleClose} className="text-gray-500 hover:text-red-500">
          <X size={16} />
        </button>
      </div>
      
      <div className="mb-3">
         <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Lofi Study (NCS Style)</p>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={togglePlay}
          className="bg-primary hover:bg-blue-600 text-white rounded-full p-2 transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>

      <audio ref={audioRef} loop src={NCS_TRACK} />
    </div>
  );
};
