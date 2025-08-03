// src/app/admin/components/AdminLayout.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay un usuario logueado
    const storedUser = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminToken');

    if (!storedUser || !token) {
      router.push('/admin/rtx322214');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
      router.push('/admin/rtx322214');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    router.push('/admin/rtx322214');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // No renderizar nada, se redirigirá en el useEffect
  }

  // Menú completo con todas las opciones del sistema
  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    { name: 'Hero Slides', href: '/admin/hero', icon: 'slideshow' },
    { name: 'Sobre Nosotros', href: '/admin/nosotros', icon: 'info' },
    { name: 'Galería', href: '/admin/galeria', icon: 'photo_library' },
    { name: 'Géneros', href: '/admin/generos', icon: 'category' },
    { name: 'Música', href: '/admin/musica', icon: 'music_note' },
    { name: 'Redes Sociales', href: '/admin/redes', icon: 'share' },
    { name: 'Mensajes', href: '/admin/mensajes', icon: 'email' },
    { name: 'Configuración', href: '/admin/configuracion', icon: 'settings' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para escritorio */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-white">
        <div className="p-4 border-b border-primary-light">
          <div className="text-xl font-bold text-secondary">CONEXION 360</div>
        </div>
        
        <div className="p-4 border-b border-primary-light">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
              {user.nombre.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.nombre}</p>
              <p className="text-xs text-gray-300">{user.rol}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-primary-light hover:text-white transition-colors"
                >
                  <span className="material-icons-outlined text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-primary-light">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-300 hover:bg-primary-light rounded-lg transition-colors"
          >
            <span className="material-icons-outlined text-lg">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
      
      {/* Header para móvil */}
      <div className="md:hidden flex flex-col w-full">
        <div className="flex items-center justify-between bg-primary text-white p-4">
          <div className="text-xl font-bold text-secondary">CONEXION 360</div>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="material-icons-outlined">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
        
        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-primary z-50">
            <ul className="p-4 space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-white hover:bg-primary-light rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="material-icons-outlined text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-300 hover:bg-primary-light rounded-lg"
                >
                  <span className="material-icons-outlined text-lg">logout</span>
                  <span>Cerrar Sesión</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
      
      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
