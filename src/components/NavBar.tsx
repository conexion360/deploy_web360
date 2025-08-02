"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Nosotros', href: '#nosotros' },
    { name: 'Galería', href: '#galeria' },
    { name: 'Géneros', href: '#generos' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'nav-scrolled' : 'nav-transparent'}`}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-white font-bold text-xl md:text-2xl relative group">
            <Image 
              src="/imagenes/conexion_logo.png" 
              alt="Conexion360 Logo" 
              width={144} 
              height={48}
              className="h-12 w-auto" 
            />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="nav-link group"
              >
                <span className="relative z-10">{link.name}</span>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link>
            ))}
            <Link 
              href="#contacto" 
              className="contact-btn relative overflow-hidden group"
            >
              <span className="relative z-10">Contáctanos</span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-light to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white focus:outline-none group"
            onClick={toggleMenu}
          >
            <div className="relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 transition-transform duration-300 group-hover:scale-110"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </button>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      <div 
        className={`md:hidden bg-primary/95 backdrop-blur-md transition-all duration-300 ${isMenuOpen ? 'max-h-64 py-4' : 'max-h-0 overflow-hidden'}`}
      >
        <div className="container mx-auto px-6 space-y-4">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              href={link.href} 
              className="mobile-nav-link group"
              onClick={closeMenu}
            >
              <span className="relative z-10">{link.name}</span>
              <div className="absolute inset-0 bg-secondary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}
          <Link 
            href="#contacto" 
            className="contact-btn block text-center"
            onClick={closeMenu}
          >
            Contáctanos
          </Link>
        </div>
      </div>
    </header>
  );
};

export default NavBar;