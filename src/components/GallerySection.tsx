// src/components/GallerySection.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react';

interface GalleryImage {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen: string;
  thumbnail: string | null;
  categoria: string | null;
  destacado: boolean;
  orden: number;
  loaded?: boolean;
  error?: boolean;
}

const GallerySection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState<GalleryImage | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Función para mezclar array (Fisher-Yates)
  const shuffleArray = (array: GalleryImage[]): GalleryImage[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Cargar imágenes de la galería desde la API
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/galeria');
        
        if (!response.ok) {
          throw new Error('Error al cargar la galería');
        }
        
        const data = await response.json();
        
        // Mezclar las imágenes para orden aleatorio
        const shuffledImages = shuffleArray(data.map((img: GalleryImage) => ({
          ...img,
          loaded: false,
          error: false
        })));
        
        setGalleryImages(shuffledImages);
        setError(null);
        
        console.log(`Cargadas ${shuffledImages.length} imágenes de la galería en orden aleatorio`);
      } catch (err) {
        console.error('Error fetching gallery images:', err);
        setError('No se pudieron cargar las imágenes de la galería');
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Calcular índices visibles para el carrusel circular
  const getVisibleSlideIndices = () => {
    const total = galleryImages.length;
    const indices = [];
    
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + total) % total;
      indices.push(index);
    }
    
    return indices;
  };

  // Calcular estilos para el efecto 3D
  const getImageStyle = (index: number): React.CSSProperties => {
    let indexDiff = index - currentIndex;
    
    // Ajuste para el carrusel circular
    if (indexDiff > galleryImages.length / 2) {
      indexDiff -= galleryImages.length;
    } else if (indexDiff < -galleryImages.length / 2) {
      indexDiff += galleryImages.length;
    }
    
    const absoluteDiff = Math.abs(indexDiff);
    
    let translateZ = 0;
    let translateX = 0;
    let rotateY = 0;
    let opacity = 1;
    let zIndex = 5;
    let scale = 1;
    const radius = 800;
    
    if (indexDiff === 0) {
      // Imagen central
      translateZ = 0;
      translateX = 0;
      rotateY = 0;
      opacity = 1;
      zIndex = 10;
      scale = 1;
    } else if (absoluteDiff <= 2) {
      // Efecto circular
      const angle = indexDiff * 0.3;
      translateZ = -radius * (1 - Math.cos(angle)) / 2;
      translateX = radius * Math.sin(angle);
      rotateY = -indexDiff * 35;
      opacity = 1 - (absoluteDiff * 0.15);
      zIndex = 5 - absoluteDiff;
      scale = 0.9 - (absoluteDiff * 0.15);
    } else {
      // Imágenes muy alejadas
      translateZ = -400;
      translateX = indexDiff * 500;
      rotateY = -indexDiff * 45;
      opacity = 0;
      zIndex = 0;
      scale = 0.7;
    }
    
    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity: opacity,
      zIndex: zIndex,
      transition: 'all 0.7s cubic-bezier(0.215, 0.610, 0.355, 1.000)'
    };
  };

  const isVisible = (index: number) => {
    return getVisibleSlideIndices().includes(index);
  };

  const nextSlide = () => {
    if (isTransitioning || galleryImages.length === 0) return;
    setIsTransitioning(true);
    
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
  };

  const prevSlide = () => {
    if (isTransitioning || galleryImages.length === 0) return;
    setIsTransitioning(true);
    
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    
    setCurrentIndex(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
  };

  const openSlide = (slide: GalleryImage, index: number) => {
    setActiveSlide(slide);
    setActiveSlideIndex(index);
    document.body.style.overflow = 'hidden';
    stopAutoplay();
  };

  const closeSlide = () => {
    setActiveSlide(null);
    document.body.style.overflow = '';
    startAutoplay();
  };

  const nextModalSlide = () => {
    const nextIndex = (activeSlideIndex + 1) % galleryImages.length;
    setActiveSlide(galleryImages[nextIndex]);
    setActiveSlideIndex(nextIndex);
  };

  const prevModalSlide = () => {
    const prevIndex = (activeSlideIndex - 1 + galleryImages.length) % galleryImages.length;
    setActiveSlide(galleryImages[prevIndex]);
    setActiveSlideIndex(prevIndex);
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (galleryImages.length > 0) {
      autoplayIntervalRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
  };

  const stopAutoplay = () => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  };

  const handleImageLoad = (index: number) => {
    setGalleryImages(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], loaded: true, error: false };
      }
      return updated;
    });
  };

  const handleImageError = (index: number) => {
    setGalleryImages(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], error: true };
      }
      return updated;
    });
  };

  // Efectos y listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeSlide) {
        closeSlide();
      }
      if (activeSlide) {
        if (e.key === 'ArrowLeft') {
          prevModalSlide();
        }
        if (e.key === 'ArrowRight') {
          nextModalSlide();
        }
      } else {
        if (e.key === 'ArrowLeft') {
          prevSlide();
        }
        if (e.key === 'ArrowRight') {
          nextSlide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeSlide, currentIndex]);

  // Autoplay
  useEffect(() => {
    if (!loading && galleryImages.length > 0) {
      startAutoplay();
    }
    return () => stopAutoplay();
  }, [loading, galleryImages.length]);

  // Crear partículas flotantes
  useEffect(() => {
    const createParticles = () => {
      const gallerySection = document.getElementById('galeria');
      if (!gallerySection) return;
      
      const particleCount = 15;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'gallery-particle';
        
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * 10;
        
        particle.style.animation = `float ${duration}s linear ${delay}s infinite`;
        
        gallerySection.appendChild(particle);
      }
    };

    createParticles();
    
    return () => {
      const particles = document.querySelectorAll('.gallery-particle');
      particles.forEach(particle => particle.remove());
    };
  }, []);

  // Implementar reveal on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, [loading]);

  if (loading) {
    return (
      <section id="galeria" className="gallery-section">
        <div className="gallery-background">
          <div className="gallery-gradient"></div>
          <div className="gallery-pattern" style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMC44IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiAvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIgLz48L3N2Zz4=')`
          }}></div>
        </div>
        
        <div className="relative container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="gallery-title reveal-on-scroll">
              <span className="gallery-title-primary">Galería de</span>
              <span className="gallery-title-secondary">Imágenes</span>
            </h2>
          </div>
          
          <div className="text-center text-white py-16">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-6 text-xl">Cargando galería...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="galeria" className="gallery-section">
      <div className="gallery-background">
        <div className="gallery-gradient"></div>
        <div className="gallery-pattern" style={{
          backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMC44IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiAvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIgLz48L3N2Zz4=')`
        }}></div>
      </div>
      
      <div className="relative container mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="gallery-title reveal-on-scroll">
            <span className="gallery-title-primary">Galería de</span>
            <span className="gallery-title-secondary">Imágenes</span>
          </h2>
        </div>
        
        {galleryImages.length === 0 ? (
          <div className="text-center text-white py-16">
            <svg className="w-20 h-20 mx-auto mb-6 text-secondary opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p className="text-xl mb-3">No se encontraron imágenes en la galería</p>
          </div>
        ) : (
          <div 
            className="carousel-3d-container reveal-on-scroll"
            onMouseEnter={stopAutoplay}
            onMouseLeave={startAutoplay}
          >
            <div className="carousel-3d-wrapper">
              <button 
                className="carousel-nav-btn carousel-prev-btn"
                onClick={prevSlide}
                aria-label="Imagen anterior"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <button 
                className="carousel-nav-btn carousel-next-btn"
                onClick={nextSlide}
                aria-label="Imagen siguiente"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              
              <div className="carousel-3d-stage">
                {galleryImages.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`carousel-3d-slide ${index === currentIndex ? 'active' : ''}`}
                    style={getImageStyle(index)}
                    onClick={() => index === currentIndex ? openSlide(slide, index) : goToSlide(index)}
                  >
                    {isVisible(index) && (
                      <div className="carousel-3d-slide-inner">
                        <img 
                          src={slide.imagen} 
                          alt={slide.titulo} 
                          className="carousel-3d-image"
                          onLoad={() => handleImageLoad(index)}
                          onError={() => handleImageError(index)}
                        />
                        
                        {slide.error && (
                          <div className="image-error-container">
                            <svg className="image-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <span>Imagen no disponible</span>
                          </div>
                        )}
                        
                        <div className="carousel-3d-overlay"></div>
                        <div className="light-effect"></div>
                        <div className="carousel-3d-reflection"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal para vista ampliada */}
      {activeSlide && (
        <div className="gallery-modal" onClick={closeSlide}>
          <div className="gallery-modal-backdrop"></div>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-modal-close" onClick={closeSlide} aria-label="Cerrar vista ampliada">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <button 
              className="modal-nav-btn modal-prev-btn" 
              onClick={(e) => {
                e.stopPropagation();
                prevModalSlide();
              }} 
              aria-label="Imagen anterior"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <button 
              className="modal-nav-btn modal-next-btn" 
              onClick={(e) => {
                e.stopPropagation();
                nextModalSlide();
              }} 
              aria-label="Imagen siguiente"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            
            <div className="modal-image-container">
              <img 
                src={activeSlide.imagen} 
                alt={activeSlide.titulo} 
                className="modal-image"
                onError={() => {
                  setActiveSlide({ ...activeSlide, error: true });
                }}
              />
              
              {activeSlide.error && (
                <div className="image-error-container">
                  <svg className="image-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <span className="text-xl">Imagen no disponible</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;