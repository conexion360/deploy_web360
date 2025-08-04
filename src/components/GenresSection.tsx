// src/components/GenresSection.tsx
"use client"
import React, { useState, useEffect } from 'react';

interface Genero {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string;
  icono: string | null;
  orden: number;
  activo: boolean;
}

const GenresSection = () => {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGeneros = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/generos');
        
        if (!response.ok) {
          throw new Error('Error al cargar los géneros');
        }
        
        const data = await response.json();
        
        // Filtrar solo los géneros activos y ordenar por el campo orden
        const generosActivos = data
          .filter((genero: Genero) => genero.activo)
          .sort((a: Genero, b: Genero) => a.orden - b.orden);
        
        setGeneros(generosActivos);
        setError(null);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError('No se pudieron cargar los géneros');
        // Usar datos fallback si hay error
        setGeneros([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGeneros();
  }, []);

  // Obtener emoji basado en el nombre del género
  const getGenreEmoji = (nombre: string) => {
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('rock')) return '🎸';
    if (nombreLower.includes('cumbia')) return '💃';
    if (nombreLower.includes('salsa')) return '🎺';
    if (nombreLower.includes('folklore') || nombreLower.includes('andino')) return '🪘';
    return '🎵'; // Emoji por defecto
  };

  return (
    <section id="generos" className="relative py-32 overflow-hidden">
      {/* Background con gradiente y efectos */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,205,208,0.1),transparent_70%)]"></div>
      </div>

      <div className="relative container mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="inline-block relative text-4xl font-bold mb-4 reveal-on-scroll">
            <span className="text-white">Géneros</span>
            <span className="text-secondary ml-2">Musicales</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mt-6 reveal-on-scroll">
            Nos especializamos en la producción de eventos de diversos géneros musicales,
            ofreciendo experiencias únicas para cada estilo.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : generos.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Contenido de respaldo si no hay géneros en la API */}
            {['Rock', 'Cumbia', 'Salsa', 'Folklore - Andino'].map((genre) => (
              <div key={genre} className="reveal-on-scroll">
                <div className="group relative rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <div className="w-full h-full bg-primary-dark flex items-center justify-center">
                      <div className="text-6xl mb-4">{getGenreEmoji(genre)}</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{genre}</h3>
                    <p className="text-gray-300 text-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      Eventos y conciertos de {genre}
                    </p>
                    <a 
                      href="#contacto" 
                      className="inline-block mt-4 text-secondary hover:text-white transition-colors duration-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      Organizar evento →
                    </a>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {generos.map((genero) => (
              <div key={genero.id} className="reveal-on-scroll">
                <div className="group relative rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105">
                  {/* Card Background with image or colored gradient */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {genero.imagen ? (
                      <div 
                        className="w-full h-full bg-primary-dark"
                        style={{
                          backgroundImage: `url(${genero.imagen})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      ></div>
                    ) : (
                      <div className="w-full h-full bg-primary-dark flex items-center justify-center">
                        <div className="text-6xl mb-4">{genero.icono ? (
                          <span className="material-icons-outlined text-6xl">{genero.icono}</span>
                        ) : getGenreEmoji(genero.nombre)}</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{genero.nombre}</h3>
                    <p className="text-gray-300 text-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      {genero.descripcion || `Eventos y conciertos de ${genero.nombre}`}
                    </p>
                    <a 
                      href="#contacto" 
                      className="inline-block mt-4 text-secondary hover:text-white transition-colors duration-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      Organizar evento →
                    </a>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GenresSection;