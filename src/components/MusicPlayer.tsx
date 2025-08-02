// src/components/MusicPlayer.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react';

interface Track {
  id: number;
  titulo: string;
  artista: string | null;
  archivo: string;
  genero_nombre?: string | null;
}

const MusicPlayer: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch tracks from API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/musica?destacado=true');
        
        if (!response.ok) {
          throw new Error('Error al cargar las pistas');
        }
        
        const data = await response.json();
        
        // Filter only tracks that are marked as reproducible_web and destacado
        const playableTracks = data.filter((track: any) => 
          track.reproducible_web === true && track.destacado === true
        );
        
        setTracks(playableTracks);
        setError(null);
      } catch (err) {
        console.error('Error fetching tracks:', err);
        setError('No se pudieron cargar las pistas');
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Handle track changes
  useEffect(() => {
    if (tracks.length > 0 && audioRef.current) {
      audioRef.current.src = tracks[currentTrack].archivo;
      
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack, tracks]);

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
    if (tracks.length === 0) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(tracks[currentTrack].archivo);
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
        setError("No se pudo reproducir la pista");
      });
    }
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  // If no tracks are available, show a minimal player with a message
  if (tracks.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 flex items-center space-x-2 max-w-[400px]">
        <div className="flex-grow flex items-center min-w-0 overflow-hidden">
          <div className="marquee-container">
            <div className="marquee-content">
              <span className="text-xs text-white/90">
                {loading ? "Cargando música..." : error || "No hay música disponible"}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 flex items-center space-x-2 max-w-[400px]">
      <button 
        onClick={prevTrack}
        className="text-white/80 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6L9 12L19 18V6Z"></path>
          <path d="M7 6L5 6L5 18H7L7 6Z"></path>
        </svg>
      </button>

      <button 
        onClick={playTrack}
        className="bg-secondary hover:bg-secondary-light text-white rounded-full p-1.5 transition-all transform hover:scale-105"
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
        className="text-white/80 hover:text-white transition-colors"
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
              {tracks[currentTrack]?.titulo} {tracks[currentTrack]?.artista ? `- ${tracks[currentTrack].artista}` : ''}
            </span>
            <span className="text-xs text-white/90">
              {tracks[currentTrack]?.titulo} {tracks[currentTrack]?.artista ? `- ${tracks[currentTrack].artista}` : ''}
            </span>
          </div>
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default MusicPlayer;