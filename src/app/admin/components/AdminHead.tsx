// src/app/admin/components/AdminHead.tsx
"use client";

import React, { useEffect } from 'react';

const AdminHead: React.FC = () => {
  useEffect(() => {
    // Asegurarse de que los íconos de Material se cargan
    // Esta función se ejecutará solo en el cliente
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined';
    
    // Verificar si el link ya existe para evitar duplicados
    if (!document.querySelector('link[href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"]')) {
      document.head.appendChild(link);
    }
  }, []);

  return null;
};

export default AdminHead;