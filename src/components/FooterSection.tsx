"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const FooterSection: React.FC = () => {
  const pathname = usePathname(); // Obtener la ruta actual
  
  // No mostrar el Footer en rutas que comiencen con /admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-primary-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Conexion 360 SAC</h3>
            <p className="text-gray-400 mb-4">
              Tu conexión a la mejor música y entretenimiento en Perú.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#inicio" className="text-gray-400 hover:text-secondary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="#nosotros" className="text-gray-400 hover:text-secondary transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="#galeria" className="text-gray-400 hover:text-secondary transition-colors">
                  Galería
                </Link>
              </li>
              <li>
                <Link href="#contacto" className="text-gray-400 hover:text-secondary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-secondary transition-colors">
                  Radio en Vivo
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-secondary transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-secondary transition-colors">
                  Publicidad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-secondary transition-colors">
                  Producción Musical
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <span className="mr-2">📍</span>
                <span>Av. Principal 123, Lima, Perú</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📱</span>
                <span>+51 123 456 789</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✉️</span>
                <span>info@conexion360.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-primary-dark border-t border-gray-800 py-4">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Conexion 360 SAC. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;