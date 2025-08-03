// src/hooks/useAuthRefresh.ts
'use client'
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthRefresh() {
  const router = useRouter();

  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Decodificar el token para verificar expiración
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return;

      const payload = JSON.parse(atob(tokenParts[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // Si el token expira en menos de 2 horas, renovarlo
      if (timeUntilExpiration < 2 * 60 * 60 * 1000) {
        console.log('Token próximo a expirar, renovando...');

        const response = await fetch('/api/auth', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          console.log('Token renovado exitosamente');
        } else {
          // Si falla la renovación, redirigir al login
          console.error('Error al renovar token');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          router.push('/admin/login');
        }
      }
    } catch (error) {
      console.error('Error en refresh token:', error);
    }
  }, [router]);

  useEffect(() => {
    // Verificar al cargar el componente
    refreshToken();

    // Verificar cada 30 minutos
    const interval = setInterval(refreshToken, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshToken]);

  return { refreshToken };
}