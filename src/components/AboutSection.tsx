// src/components/AboutSection.tsx
"use client"
import React, { useState, useEffect } from 'react';

interface AboutData {
  id?: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  caracteristicas: Caracteristica[];
  estadisticas: Estadistica[];
}

interface Caracteristica {
  id?: number;
  titulo: string;
  icono: string;
  orden: number;
}

interface Estadistica {
  id?: number;
  valor: string;
  descripcion: string;
  orden: number;
}

const AboutSection: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/nosotros');
        
        if (!response.ok) {
          throw new Error('Error al cargar la información de Sobre Nosotros');
        }
        
        const data = await response.json();
        setAboutData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching about data:', err);
        setError('No se pudo cargar la información. Usando datos por defecto.');
        // Usar datos de respaldo si falla la carga
        setAboutData({
          titulo: 'Nuestra Pasión por la Música',
          descripcion: 'Somos una empresa líder en la producción de eventos musicales en el Perú, con más de 15 años de experiencia creando experiencias memorables para los amantes de la música.',
          imagen: '',
          caracteristicas: [
            { titulo: 'Producción integral de conciertos y festivales', icono: 'check_circle', orden: 1 },
            { titulo: 'Manejo profesional de artistas nacionales e internacionales', icono: 'check_circle', orden: 2 },
            { titulo: 'Infraestructura y equipo técnico de última generación', icono: 'check_circle', orden: 3 },
            { titulo: 'Experiencia en todos los géneros musicales', icono: 'check_circle', orden: 4 }
          ],
          estadisticas: [
            { valor: '20+', descripcion: 'Años de experiencia', orden: 1 },
            { valor: '100+', descripcion: 'Eventos realizados', orden: 2 },
            { valor: '50+', descripcion: 'Artistas internacionales', orden: 3 },
            { valor: '1M+', descripcion: 'Asistentes felices', orden: 4 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAboutData();
  }, []);

  // Función para obtener la URL de la imagen o mostrar un placeholder
  const getImageUrl = () => {
    if (aboutData?.imagen && aboutData.imagen !== '') {
      return aboutData.imagen;
    }
    return null; // No hay imagen, se mostrará el placeholder
  };

  return (
    <section id="nosotros" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,205,208,0.1)_0%,rgba(3,28,59,0.1)_100%)]"></div>
      </div>
      
      <div className="relative container mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="inline-block relative text-4xl font-bold mb-4 reveal-on-scroll">
            <span className="text-white">Sobre</span>
            <span className="text-secondary ml-2">Nosotros</span>
            <div className="absolute -inset-2 bg-secondary/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-6 reveal-on-scroll">
              <h3 className="text-2xl font-semibold text-white">{aboutData?.titulo || 'Nuestra Pasión por la Música'}</h3>
              <p className="text-gray-300 leading-relaxed">
                {aboutData?.descripcion || 
                  'Somos una empresa líder en la producción de eventos musicales en el Perú, con más de 15 años de experiencia creando experiencias memorables para los amantes de la música.'}
              </p>
              <ul className="space-y-4">
                {aboutData?.caracteristicas.map((feature, index) => (
                  <li key={feature.id || index} className="flex items-center group">
                    <div className="relative mr-4">
                      <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                        <span className="material-icons-outlined text-secondary">
                          {feature.icono || 'check_circle'}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-secondary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-all duration-300 scale-125"></div>
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors duration-300">{feature.titulo}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative group reveal-on-scroll">
              <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative overflow-hidden rounded-2xl bg-primary-dark/50 h-80 flex items-center justify-center">
                {getImageUrl() ? (
                  <img 
                    src={getImageUrl() || ''} 
                    alt="Sobre Nosotros" 
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">🎵</div>
                    <p className="text-gray-300">Las imágenes de eventos se mostrarán aquí</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
          {aboutData?.estadisticas.map((stat, index) => (
            <div key={stat.id || index} className="group reveal-on-scroll">
              <div className="relative p-6 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-4xl font-bold text-secondary mb-2">{stat.valor}</div>
                  <div className="text-gray-300 group-hover:text-white transition-colors duration-300">{stat.descripcion}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;