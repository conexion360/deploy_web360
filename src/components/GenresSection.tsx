import React from 'react'

const GenresSection = () => {
  const genres = [
    {
      id: 1,
      name: 'Rock',
      image: '/imagenes/eventos/genero_rock.jpg',
      description: 'Conciertos y festivales de Rock'
    },
    {
      id: 2,
      name: 'Cumbia',
      image: '/imagenes/eventos/genero_cumbia.jpg',
      description: 'Eventos y giras de Cumbia.'
    },
    {
      id: 3,
      name: 'Salsa',
      image: '/imagenes/eventos/genero_salsa.jpg',
      description: 'Salsa con los mejores.'
    },
    {
      id: 4,
      name: 'Folklore - Andino',
      image: '/imagenes/eventos/musica_andina.jpg',
      description: 'Festivales de música tradicional peruana.'
    }
  ];

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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {genres.map((genre) => (
            <div 
              key={genre.id} 
              className="reveal-on-scroll"
            >
              <div className="group relative rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105">
                {/* Card Background & Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={genre.image} 
                    alt={genre.name} 
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                </div>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{genre.name}</h3>
                  <p className="text-gray-300 text-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    {genre.description}
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
      </div>
    </section>
  );
};

export default GenresSection;