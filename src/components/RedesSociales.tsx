"use client"
import React, { useEffect } from 'react';

const RedesSociales: React.FC = () => {
  const socialNetworks = [
    {
      name: 'Facebook',
      username: '@360conexion',
      url: 'https://www.facebook.com/360conexion',
      color: 'bg-blue-600',
      iconPath: `<path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />`
    },
    {
      name: 'Instagram',
      username: '@conexion360sac',
      url: 'https://www.instagram.com/conexion360sac/',
      color: 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500',
      iconPath: `<path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.218-1.79.465-2.428.247-.667.642-1.272 1.153-1.772a4.91 4.91 0 011.772-1.153c.637-.247 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />`
    },
    {
      name: 'TikTok',
      username: '@conexion360.sac',
      url: 'https://www.tiktok.com/@conexion360.sac',
      color: 'bg-black',
      iconPath: `<path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 015.45 5.45v7.5a4.27 4.27 0 004.25 4.3 4.27 4.27 0 004.35-4.3V8.7a8.55 8.55 0 002.55.33v-3.2a4.4 4.4 0 01-2.7-.83V8.5a4.36 4.36 0 01-3.35-4.35v-2.5c0-.65.15-1.26.35-1.83A4.29 4.29 0 0012.2 5a4.27 4.27 0 004.35 4.3v-3.5h.05z" />`
    }
  ];

  // Función para abrir enlaces
  const openSocial = (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    // Implementación del efecto reveal-on-scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    // Observar elementos con la clase reveal-on-scroll
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section id="redes-sociales" className="relative py-24 overflow-hidden">
      {/* Fondo simplificado */}
      <div className="absolute inset-0 bg-primary-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,205,208,0.08),transparent_40%)]"></div>
      </div>
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-16 reveal-on-scroll">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="text-white">Nuestras</span>
            <span className="text-secondary ml-2">Redes Sociales</span>
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-lg mt-4">
            Mantente conectado con nosotros y entérate de todos nuestros eventos. 
            Síguenos en nuestras plataformas para no perderte nuestra música.
          </p>
        </div>
        
        {/* Tarjetas de redes sociales */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {socialNetworks.map((network, index) => (
            <div 
              key={network.name}
              className="reveal-on-scroll transition-all duration-500"
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => openSocial(network.url)}
            >
              <div className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg h-full">
                {/* Icono */}
                <div className="relative mx-auto mb-6 w-20 h-20">
                  <div className={`${network.color} rounded-full flex items-center justify-center w-20 h-20 transition-transform duration-300 hover:scale-105`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="36" 
                      height="36" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                      className="text-white"
                      dangerouslySetInnerHTML={{ __html: network.iconPath }}
                    ></svg>
                  </div>
                </div>
                
                {/* Contenido */}
                <h4 className="text-2xl font-bold text-white mb-2">{network.name}</h4>
                <p className="text-gray-400 mb-4">{network.username}</p>
                
                {/* Botón */}
                <div className="text-secondary font-medium inline-flex items-center gap-1">
                  Seguir
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RedesSociales;