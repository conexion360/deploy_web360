'use client'
import React, { useEffect, useState } from 'react';
import Head from 'next/head';

interface SiteConfig {
  nombre_sitio: string;
  logo: string | null;
  favicon: string | null;
  email_contacto: string | null;
  telefono: string | null;
  direccion: string | null;
  footer_texto: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
}

const DynamicHead: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/configuracion');
        if (!response.ok) {
          throw new Error('Error al cargar la configuración');
        }
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Error fetching site configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    // Update favicon when config loads
    if (config?.favicon) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.setAttribute('rel', 'shortcut icon');
      link.setAttribute('href', config.favicon);
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    // Update site title if needed
    if (config?.nombre_sitio) {
      document.title = config.nombre_sitio;
    }

    // Add Material Icons for admin panel
    const materialIconsLink = document.createElement('link');
    materialIconsLink.rel = 'stylesheet';
    materialIconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined';
    
    // Check if the link already exists to avoid duplicates
    if (!document.querySelector('link[href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"]')) {
      document.head.appendChild(materialIconsLink);
    }
  }, [config]);

  return null; // This component doesn't render anything directly
};

export default DynamicHead;