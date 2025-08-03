// src/components/FooterSection.tsx - FIXED VERSION
"use client"
import React from 'react';
import { usePathname } from 'next/navigation';

const FooterSection: React.FC = () => {
  const pathname = usePathname(); // Obtener la ruta actual
  
  // No mostrar el Footer en rutas que comiencen con /admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-primary-dark text-white py-4">
      <div className="container mx-auto px-4 text-center text-gray-400">
        <p>&copy; 2025 Conexion 360 SAC. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default FooterSection;