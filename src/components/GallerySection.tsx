"use client"
import React, { useState, useEffect } from 'react';

const GallerySection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState<{id: number, title: string, description: string} | null>(null);
  
  const galleryImages = [
    { id: 1, title: 'Evento 1', description: 'Descripción del evento 1' },
    { id: 2, title: 'Evento 2', description: 'Descripción del evento 2' },
    { id: 3, title: 'Evento 3', description: 'Descripción del evento 3' },
    { id: 4, title: 'Evento 4', description: 'Descripción del evento 4' },
    { id: 5, title: 'Evento 5', description: 'Descripción del evento 5' },
  ];

  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  const openModal = (slide: {id: number, title: string, description: string}) => {
    setActiveSlide(slide);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = '';
  };

  const nextModalSlide = () => {
    if (activeSlide) {
      const currentIndex = galleryImages.findIndex(img => img.id === activeSlide.id);
      const nextIndex = (currentIndex + 1) % galleryImages.length;
      setActiveSlide(galleryImages[nextIndex]);
    }
  };

  const prevModalSlide = () => {
    if (activeSlide) {
      const currentIndex = galleryImages.findIndex(img => img.id === activeSlide.id);
      const prevIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
      setActiveSlide(galleryImages[prevIndex]);
    }
  };

  // Cuando el componente se monta, se inicia el autoplay
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  // Efecto para manejar teclas de escape y flechas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
      if (modalOpen) {
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
  }, [modalOpen, activeSlide]);

  // Función para crear partículas decorativas
  useEffect(() => {
    const createParticles = () => {
      const gallerySection = document.getElementById('galeria');
      if (!gallerySection) return;
      
      const particleCount = 15;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'gallery-particle';
        
        // Tamaño aleatorio
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Posición inicial aleatoria
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        // Duración y retardo aleatorio
        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * 10;
        
        // Aplicar animación
        particle.style.animation = `float ${duration}s linear ${delay}s infinite`;
        
        // Agregar partícula al DOM
        gallerySection.appendChild(particle);
      }
    };

    createParticles();
    
    // Cleanup function to remove particles
    return () => {
      const particles = document.querySelectorAll('.gallery-particle');
      particles.forEach(particle => {
        particle.remove();
      });
    };
  }, []);

  return (
    <section id="galeria" className="gallery-section">
      <div className="gallery-background"></div>
      <div className="gallery-gradient"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-12 reveal-on-scroll">
          <h2 className="gallery-title">
            <span className="gallery-title-primary">Nuestra</span>
            <span className="gallery-title-secondary">Galería</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explora nuestra colección de momentos memorables y eventos destacados
          </p>
        </div>
        
        <div className="carousel-3d-container reveal-on-scroll">
          <div className="carousel-3d-wrapper">
            <div className="carousel-3d-stage">
              {galleryImages.map((image, index) => {
                // Cálculo para posicionar las diapositivas en un carrusel 3D
                const position = index - activeIndex;
                const zIndex = galleryImages.length - Math.abs(position);
                const opacity = Math.abs(position) > 2 ? 0 : 1 - Math.abs(position) * 0.3;
                const translateZ = -Math.abs(position) * 150;
                const rotateY = position * 45;
                
                return (
                  <div 
                    key={image.id}
                    className={`carousel-3d-slide ${index === activeIndex ? 'active' : ''}`}
                    style={{
                      transform: `translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                      opacity,
                      zIndex
                    }}
                    onClick={() => index === activeIndex ? openModal(image) : setActiveIndex(index)}
                  >
                    <div className="carousel-3d-slide-inner">
                      <div className="bg-gray-800 h-full w-full flex items-center justify-center text-white">
                        {image.title}
                      </div>
                      <div className="carousel-3d-overlay">
                        <div className="p-6 absolute bottom-0 w-full">
                          <h3 className="text-xl font-bold text-white">{image.title}</h3>
                          <p className="text-gray-200">{image.description}</p>
                        </div>
                      </div>
                      <div className="light-effect"></div>
                    </div>
                    <div className="carousel-3d-reflection"></div>
                  </div>
                );
              })}
            </div>
            
            <button className="carousel-nav-btn carousel-prev-btn" onClick={prevSlide} aria-label="Imagen anterior">
              &lt;
            </button>
            <button className="carousel-nav-btn carousel-next-btn" onClick={nextSlide} aria-label="Imagen siguiente">
              &gt;
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal para vista ampliada */}
      {modalOpen && activeSlide && (
        <div className="gallery-modal" onClick={closeModal}>
          <div className="gallery-modal-backdrop"></div>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-modal-close" onClick={closeModal} aria-label="Cerrar vista ampliada">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <button className="modal-nav-btn modal-prev-btn" onClick={prevModalSlide} aria-label="Imagen anterior">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <button className="modal-nav-btn modal-next-btn" onClick={nextModalSlide} aria-label="Imagen siguiente">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            
            <div className="modal-image-container">
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xl">
                {activeSlide.title}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;