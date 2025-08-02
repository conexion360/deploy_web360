// src/app/admin/dashboard/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';

// Componente para tarjetas de administración
const AdminCard = ({ title, description, icon, color, href }: { 
  title: string, 
  description: string, 
  icon: string, 
  color: string, 
  href: string 
}) => {
  return (
    <Link href={href} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className={`${color} h-2 w-full`}></div>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`${color} bg-opacity-20 rounded-full p-3`}>
            <span className={`material-icons-outlined text-2xl ${color.replace('bg-', 'text-')}`}>{icon}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-gray-600 mt-1">{description}</p>
            <div className="mt-4 flex justify-end">
              <span className="inline-flex items-center text-sm font-medium text-secondary hover:text-secondary-light">
                Administrar
                <span className="material-icons-outlined text-sm ml-1">arrow_forward</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    slides: 0,
    galeria: 0,
    generos: 0,
    musicas: 0,
    mensajes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // En un entorno real aquí harías peticiones a la API para obtener estadísticas
        // Por ahora, simulamos datos
        setStats({
          slides: 5,
          galeria: 12,
          generos: 4,
          musicas: 10,
          mensajes: 3
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona el contenido de tu sitio web</p>
        </header>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <>
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Hero Slides</p>
                    <p className="text-2xl font-bold">{stats.slides}</p>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <span className="material-icons-outlined text-blue-500">slideshow</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Galería</p>
                    <p className="text-2xl font-bold">{stats.galeria}</p>
                  </div>
                  <div className="bg-purple-100 p-2 rounded-full">
                    <span className="material-icons-outlined text-purple-500">photo_library</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Géneros</p>
                    <p className="text-2xl font-bold">{stats.generos}</p>
                  </div>
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <span className="material-icons-outlined text-yellow-500">category</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Música</p>
                    <p className="text-2xl font-bold">{stats.musicas}</p>
                  </div>
                  <div className="bg-pink-100 p-2 rounded-full">
                    <span className="material-icons-outlined text-pink-500">music_note</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Mensajes</p>
                    <p className="text-2xl font-bold">{stats.mensajes}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-full">
                    <span className="material-icons-outlined text-green-500">email</span>
                  </div>
                </div>
              </div>
            </div>
          
            {/* Tarjetas de acciones principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AdminCard 
                title="Hero Slides" 
                description="Gestiona las imágenes del carrusel principal" 
                icon="slideshow" 
                color="bg-blue-500" 
                href="/admin/hero"
              />
              
              <AdminCard 
                title="Sobre Nosotros" 
                description="Edita la información de la sección Nosotros" 
                icon="info" 
                color="bg-green-500" 
                href="/admin/nosotros"
              />
              
              <AdminCard 
                title="Galería" 
                description="Administra las imágenes de la galería" 
                icon="photo_library" 
                color="bg-purple-500" 
                href="/admin/galeria"
              />
              
              <AdminCard 
                title="Géneros Musicales" 
                description="Gestiona los géneros musicales" 
                icon="category" 
                color="bg-yellow-500" 
                href="/admin/generos"
              />
              
              <AdminCard 
                title="Música" 
                description="Sube y administra archivos de audio" 
                icon="music_note" 
                color="bg-pink-500" 
                href="/admin/musica"
              />
              
              <AdminCard 
                title="Mensajes" 
                description="Revisa los mensajes de contacto" 
                icon="email" 
                color="bg-indigo-500" 
                href="/admin/mensajes"
              />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}