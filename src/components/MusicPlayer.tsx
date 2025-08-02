
// src/components/MusicPlayer.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react';

const MusicPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tracksAvailable, setTracksAvailable] = useState<boolean[]>([false, false, false]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playlist = [
    { 
      title: 'Corazón Serrano - Mix Poco Yo - Camino A Un Sueño',
      file: "/musicas/Corazón Serrano - Mix Poco Yo - Camino A Un Sueño.mp3",
    },
    { 
      title: 'La Bella Luz - Disjockey',
      file: "/musicas/La Bella Luz   Disjockey.mp3",
    },
    { 
      title: 'Caribeños De Guadalupe Ft. Josimar - Otra Vez Me Enamoré',
      file: "/musicas/Caribeños De Guadalupe Ft. Josimar - Otra Vez Me Enamoré.mp3",
    }
  ];

  // Check if tracks exist
  useEffect(() => {
    const checkTracks = async () => {
      const availabilityPromises = playlist.map(async (track, index) => {
        try {
          const response = await fetch(track.file, { method: 'HEAD' });
          return response.ok;
        } catch (error) {
          return false;
        }
      });

      const availability = await Promise.all(availabilityPromises);
      setTracksAvailable(availability);
    };

    checkTracks();
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && tracksAvailable[currentTrack]) {
      audioRef.current.src = playlist[currentTrack].file;
      
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack, tracksAvailable]);

  const startProgressTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (audioRef.current && isPlaying) {
        const duration = audioRef.current.duration || 1;
        setProgress((audioRef.current.currentTime / duration) * 100);
      }
    }, 100);
  };

  const playTrack = () => {
    // If no tracks are available, do nothing
    if (!tracksAvailable.some(available => available)) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(playlist[currentTrack].file);
      audioRef.current.addEventListener('ended', nextTrack);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        startProgressTimer();
      }).catch(err => {
        console.error("Error playing audio:", err);
      });
    }
  };

  const prevTrack = () => {
    // Find previous available track
    let newIndex = currentTrack;
    do {
      newIndex = (newIndex - 1 + playlist.length) % playlist.length;
      if (tracksAvailable[newIndex]) break;
    } while (newIndex !== currentTrack);
    
    setCurrentTrack(newIndex);
  };

  const nextTrack = () => {
    // Find next available track
    let newIndex = currentTrack;
    do {
      newIndex = (newIndex + 1) % playlist.length;
      if (tracksAvailable[newIndex]) break;
    } while (newIndex !== currentTrack);
    
    setCurrentTrack(newIndex);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 flex items-center space-x-2 max-w-[400px]">
      <button 
        onClick={prevTrack}
        className={`text-white/80 hover:text-white transition-colors ${!tracksAvailable.some(available => available) ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!tracksAvailable.some(available => available)}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6L9 12L19 18V6Z"></path>
          <path d="M7 6L5 6L5 18H7L7 6Z"></path>
        </svg>
      </button>

      <button 
        onClick={playTrack}
        className={`bg-secondary hover:bg-secondary-light text-white rounded-full p-1.5 transition-all transform hover:scale-105 ${!tracksAvailable.some(available => available) ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!tracksAvailable.some(available => available)}
      >
        {!isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
          </svg>
        )}
      </button>

      <button 
        onClick={nextTrack}
        className={`text-white/80 hover:text-white transition-colors ${!tracksAvailable.some(available => available) ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!tracksAvailable.some(available => available)}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 18L15 12L5 6V18Z"></path>
          <path d="M17 6H19V18H17V6Z"></path>
        </svg>
      </button>

      <div className="flex-grow flex items-center min-w-0 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content">
            <span className="text-xs text-white/90">
              {tracksAvailable.some(available => available) 
                ? playlist[currentTrack].title
                : "Música disponible después de la configuración"}
            </span>
            <span className="text-xs text-white/90">
              {tracksAvailable.some(available => available) 
                ? playlist[currentTrack].title
                : "Música disponible después de la configuración"}
            </span>
          </div>
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default MusicPlayer;