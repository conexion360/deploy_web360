// src/components/HeroSection.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import MusicPlayer from './MusicPlayer';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';

interface HeroSlide {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen_desktop: string;
  imagen_mobile: string;
  orden: number;
  activo: boolean;
}

const HeroSection: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar si es móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    setTimeout(() => {
      setIsLoaded(true);
    }, 150);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Cargar slides desde la API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch('/api/hero');
        if (!response.ok) {
          throw new Error('Error al cargar los slides');
        }
        
        const data = await response.json();
        // Filtrar solo los slides activos
        const activeSlides = data.filter((slide: HeroSlide) => slide.activo);
        // Ordenar por el campo orden
        activeSlides.sort((a: HeroSlide, b: HeroSlide) => a.orden - b.orden);
        
        setSlides(activeSlides);
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        // No establecer slides por defecto, usar un array vacío
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlides();
  }, []);

  if (loading) {
    return (
      <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary"></div>
      </section>
    );
  }

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0 z-0">
        {slides.length > 0 ? (
          <Swiper
            modules={[Autoplay, EffectFade]}
            slidesPerView={1}
            effect="fade"
            speed={800}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false
            }}
            className="absolute inset-0 w-full h-full"
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.id} className="w-full h-full">
                <div className="relative w-full h-full">
                  {/* Desktop image */}
                  {!isMobile ? (
                    <div
                      className="w-full h-full bg-primary-dark"
                      style={{
                        backgroundImage: `url(${slide.imagen_desktop})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  ) : (
                    /* Mobile image */
                    <div
                      className="w-full h-full bg-primary-dark"
                      style={{
                        backgroundImage: `url(${slide.imagen_mobile})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 20%'
                      }}
                    />
                  )}
                  
                  {/* Gradient overlay */}
                  <div 
                    className={`absolute inset-0 ${
                      isMobile 
                        ? 'bg-gradient-to-b from-primary/90 via-primary/70 to-primary/50' 
                        : 'bg-gradient-to-r from-primary/95 via-primary/70 to-primary/40'
                    }`}
                  ></div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          // Fallback when no slides exist
          <div className="absolute inset-0 bg-primary-dark">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/40"></div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div 
        className={`relative z-20 container mx-auto px-4 md:px-6 ${
          isMobile ? 'pt-32 pb-16' : 'py-0'
        }`}
      >
        <div 
          className={`max-w-4xl relative ${
            isMobile ? 'mt-[45vh]' : 'pl-0 sm:pl-4 md:pl-8'
          }`}
          style={{
            transition: 'all 1s ease-out',
            opacity: isLoaded ? '1' : '0',
            transform: isLoaded ? 'translateX(0)' : 'translateX(-2rem)'
          }}
        >
          {/* Logo (desktop only) */}
          {!isMobile && (
            <div className="mb-6 md:mb-8 text-center sm:text-left">
              <h1 className="text-3xl md:text-5xl font-bold text-white">
                CONEXION 360 <span className="text-secondary">SAC</span>
              </h1>
            </div>
          )}
          
          {/* Description */}
          <p 
            className={`text-gray-300 text-base md:text-xl mb-6 md:mb-12 text-center sm:text-left leading-relaxed max-w-xl mx-auto sm:mx-0 transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '0.5s' }}
          >
            Líderes en la producción y organización de eventos de Rock, 
            Cumbia, Salsa, Folklore y más. Convierte tu evento en una 
            experiencia inolvidable con nosotros.
          </p>

          {/* Buttons */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 mb-8 md:mb-16 justify-center sm:justify-start transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '0.7s' }}
          >
            <a href="#contacto" className="btn-primary group w-full sm:w-auto text-center">
              <span className="relative z-10">CONTÁCTANOS</span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-light to-secondary opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </a>
            <a href="#nosotros" className="btn-outline group w-full sm:w-auto text-center">
              <span className="relative z-10">CONOCE MÁS</span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary-light opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </a>
          </div>

          {/* Genre icons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-8 max-w-xs sm:max-w-sm mx-auto sm:mx-0 mb-8">
            {['Rock', 'Cumbia', 'Salsa', 'Folklore'].map((genre, index) => (
              <div 
                key={genre}
                className={`opacity-0 transform transition-all duration-500 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'translate-y-8'
                }`}
                style={{ transitionDelay: `${800 + index * 100}ms` }}
              >
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-2 md:p-4 hover:bg-white/10 transition-all duration-500 transform hover:scale-110 hover:shadow-glow group">
                  <div className="relative">
                    <span className="text-xl md:text-2xl">{['🎸', '💃', '🎺', '🪘'][index]}</span>
                    <div className="absolute inset-0 bg-secondary/10 filter blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  </div>
                  <p className="text-xs md:text-sm text-gray-300 mt-2 font-medium">{genre}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Music player */}
          <div 
            className={`opacity-0 transform transition-all duration-1000 mx-auto sm:mx-0 max-w-xs sm:max-w-none ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '900ms' }}
          >
            <MusicPlayer />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;