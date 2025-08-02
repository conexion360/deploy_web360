import React from 'react';
import Image from 'next/image';

const AboutSection: React.FC = () => {
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
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-6 reveal-on-scroll">
            <h3 className="text-2xl font-semibold text-white">Nuestra Pasión por la Música</h3>
            <p className="text-gray-300 leading-relaxed">
              Somos una empresa líder en la producción de eventos musicales en el Perú, 
              con más de 15 años de experiencia creando experiencias memorables para los amantes de la música.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Nuestra misión es ofrecer eventos de alta calidad que superen las expectativas de artistas y público, 
              cuidando cada detalle técnico, logístico y creativo.
            </p>
            <ul className="space-y-4">
              {[
                'Producción integral de conciertos y festivales',
                'Manejo profesional de artistas nacionales e internacionales',
                'Infraestructura y equipo técnico de última generación',
                'Experiencia en todos los géneros musicales'
              ].map((feature, index) => (
                <li key={index} className="flex items-center group">
                  <div className="relative mr-4">
                    <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div className="absolute inset-0 bg-secondary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-all duration-300 scale-125"></div>
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative group reveal-on-scroll">
            <div className="absolute -inset-4 bg-gradient-to-r from-secondary/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative overflow-hidden rounded-2xl">
              <Image 
                src="/imagenes/eventos/conexion_360.png"
                alt="Equipo de trabajo en evento"
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-white text-lg font-semibold">Muchos eventos producidos con éxito</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '20+', label: 'Años de experiencia' },
            { value: '100+', label: 'Eventos realizados' },
            { value: '50+', label: 'Artistas internacionales' },
            { value: '1M+', label: 'Asistentes felices' }
          ].map((stat, index) => (
            <div key={index} className="group reveal-on-scroll">
              <div className="relative p-6 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 transform hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-transparent rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative">
                  <div className="text-4xl font-bold text-secondary mb-2">{stat.value}</div>
                  <div className="text-gray-300 group-hover:text-white transition-colors duration-300">{stat.label}</div>
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