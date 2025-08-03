// src/components/admin/DebugToken.tsx
'use client'
import React from 'react';

const DebugToken: React.FC = () => {
  const checkToken = () => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    console.log('=== DEBUG TOKEN INFO ===');
    console.log('Token exists:', !!token);
    console.log('Token value:', token);
    console.log('User:', user);
    
    if (token) {
      try {
        // Decodificar el token
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          
          // Verificar expiración
          const exp = payload.exp * 1000;
          const now = Date.now();
          const isExpired = exp < now;
          
          console.log('Token expiration:', new Date(exp));
          console.log('Current time:', new Date(now));
          console.log('Is expired:', isExpired);
          console.log('Time until expiration:', Math.floor((exp - now) / 1000 / 60), 'minutes');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    
    // Test API call
    testApiCall();
  };
  
  const testApiCall = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('=== TEST API CALL ===');
      console.log('Sending token:', token);
      
      const response = await fetch('/api/galeria', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
    } catch (error) {
      console.error('Test API call error:', error);
    }
  };
  
  const refreshToken = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };
  
  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-sm font-bold mb-2">Debug Token</h3>
      <div className="space-y-2">
        <button
          onClick={checkToken}
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs w-full"
        >
          Check Token
        </button>
        <button
          onClick={refreshToken}
          className="bg-red-500 text-white px-3 py-1 rounded text-xs w-full"
        >
          Clear & Re-login
        </button>
      </div>
    </div>
  );
};

export default DebugToken;