// src/app/admin/musica/page.tsx
'use client'
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';

interface TrackItem {
  id: number;
  titulo: string;
  artista: string | null;
  archivo: string;
  imagen_cover: string | null;
  genero_id: number | null;
  genero_nombre: string | null;
  destacado: boolean;
  reproducible_web: boolean;
  orden: number | null;
}

export default function MusicaAdmin() {
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [generoFilter, setGeneroFilter] = useState<number | null>(null);
  const [generos, setGeneros] = useState<{id: number, nombre: string}[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cargar los tracks y géneros
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar tracks
        const tracksResponse = await fetch('/api/musica', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!tracksResponse.ok) {
          throw new Error('Error al cargar la música');
        }
        
        const tracksData = await tracksResponse.json();
        setTracks(tracksData);
        
        // Cargar géneros
        const generosResponse = await fetch('/api/generos', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!generosResponse.ok) {
          throw new Error('Error al cargar los géneros');
        }
        
        const generosData = await generosResponse.json();
        setGeneros(generosData.map((g: any) => ({ id: g.id, nombre: g.nombre })));
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('No se pudo cargar la información. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Limpiar el audio al desmontar
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = (id: number, audioUrl: string) => {
    // Si ya hay un audio reproduciéndose, lo detenemos
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Si pulsamos en la misma canción que estaba reproduciéndose, la detenemos
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
      audioRef.current = null;
      return;
    }

    // Reproducimos la nueva canción
    const audio = new Audio(audioUrl);
    audio.play();
    audio.addEventListener('ended', () => {
      setCurrentlyPlaying(null);
      audioRef.current = null;
    });

    setCurrentlyPlaying(id);
    audioRef.current = audio;
  };

  const handleToggleDestacado = async (id: number) => {
    try {
      // Encontrar el track actual
      const track = tracks.find(t => t.id === id);
      if (!track) return;
      
      // Actualizar en la API
      const response = await fetch(`/api/musica/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...track,
          destacado: !track.destacado
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la canción');
      }
      
      // Actualizar el estado local
      setTracks(tracks.map(track => 
        track.id === id ? { ...track, destacado: !track.destacado } : track
      ));
      
      setSuccess('Canción actualizada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling destacado state:', error);
      setError('No se pudo actualizar la canción. Por favor, intenta de nuevo.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleReproducible = async (id: number) => {
    try {
      // Encontrar el track actual
      const track = tracks.find(t => t.id === id);
      if (!track) return;
      
      // Actualizar en la API
      const response = await fetch(`/api/musica/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...track,
          reproducible_web: !track.reproducible_web
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la canción');
      }
      
      // Actualizar el estado local
      setTracks(tracks.map(track => 
        track.id === id ? { ...track, reproducible_web: !track.reproducible_web } : track
      ));
      
      setSuccess('Canción actualizada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling reproducible state:', error);
      setError('No se pudo actualizar la canción. Por favor, intenta de nuevo.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta canción? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/musica/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar la canción');
        }
        
        // Detener reproducción si es la canción actual
        if (currentlyPlaying === id && audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
          setCurrentlyPlaying(null);
        }
        
        // Actualizar el estado local
        setTracks(tracks.filter(track => track.id !== id));
        
        setSuccess('Canción eliminada correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting track:', error);
        setError('No se pudo eliminar la canción. Por favor, intenta de nuevo.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Filtrar tracks por género si hay un filtro activo
  const filteredTracks = generoFilter
    ? tracks.filter(track => track.genero_id === generoFilter)
    : tracks;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Biblioteca de Música</h1>
          <Link 
            href="/admin/musica/nueva" 
            className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-secondary-light transition-colors"
          >
            <span className="material-icons-outlined">add</span>
            <span>Subir Música</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        {/* Filtros de género */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filtrar por género:</span>
            <button
              onClick={() => setGeneroFilter(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                generoFilter === null 
                  ? 'bg-secondary text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            {generos.map(genero => (
              <button
                key={genero.id}
                onClick={() => setGeneroFilter(genero.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  generoFilter === genero.id 
                    ? 'bg-secondary text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {genero.nombre}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">
              {generoFilter 
                ? `No hay canciones en el género seleccionado.` 
                : 'No hay canciones disponibles. Sube una para comenzar.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artista
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Género
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destacado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reproducible
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTracks.map((track) => (
                    <tr key={track.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {track.imagen_cover ? (
                            <div className="h-10 w-10 rounded-md overflow-hidden mr-3">
                              <div 
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${track.imagen_cover})` }}
                              ></div>
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center mr-3">
                              <span className="material-icons-outlined text-gray-400">music_note</span>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{track.titulo}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{track.artista || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {track.genero_nombre || 'Sin género'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${track.destacado ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {track.destacado ? 'Destacado' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${track.reproducible_web ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {track.reproducible_web ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handlePlayPause(track.id, track.archivo)}
                            className="p-1 rounded text-blue-600 hover:bg-blue-50"
                            title={currentlyPlaying === track.id ? 'Detener' : 'Reproducir'}
                          >
                            <span className="material-icons-outlined">
                              {currentlyPlaying === track.id ? 'pause' : 'play_arrow'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleToggleDestacado(track.id)}
                            className={`p-1 rounded ${track.destacado ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'}`}
                            title={track.destacado ? 'Quitar destacado' : 'Destacar'}
                          >
                            <span className="material-icons-outlined">
                              {track.destacado ? 'star' : 'star_border'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleToggleReproducible(track.id)}
                            className={`p-1 rounded ${track.reproducible_web ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                            title={track.reproducible_web ? 'Deshabilitar reproducción' : 'Habilitar reproducción'}
                          >
                            <span className="material-icons-outlined">
                              {track.reproducible_web ? 'headphones' : 'headphones_off'}
                            </span>
                          </button>
                          <Link
                            href={`/admin/musica/editar/${track.id}`}
                            className="p-1 rounded text-blue-600 hover:bg-blue-50"
                            title="Editar"
                          >
                            <span className="material-icons-outlined">edit</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(track.id)}
                            className="p-1 rounded text-red-600 hover:bg-red-50"
                            title="Eliminar"
                          >
                            <span className="material-icons-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}