'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SecretAdminLogin() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const router = useRouter();
  
  // Verificar si ya hay una sesión activa
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (token && user) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setDebugInfo(null);

      // Llamada a la API de autenticación
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          error: data.error || 'Error desconocido',
          data
        });
        
        throw new Error(data.error || 'Credenciales inválidas');
      }

      // Verificar que la respuesta contiene los datos necesarios
      if (!data.token || !data.user) {
        setDebugInfo({
          invalidResponse: true,
          data
        });
        throw new Error('Respuesta de autenticación inválida');
      }

      // Guardar token y datos del usuario en localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      // Redireccionar al panel de administración
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Error durante el inicio de sesión:', err);
      setError(err.message || 'Error en el inicio de sesión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestDBConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-db');
      const data = await response.json();
      
      setDebugInfo({
        dbTest: data
      });
    } catch (error: any) {
      setError('Error al verificar la conexión a la DB: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-48 mx-auto mb-6 relative">
            <div className="text-2xl font-bold text-white">CONEXION 360</div>
          </div>
          <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          <p className="text-gray-300 mt-2">Área restringida</p>
        </div>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/20 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Ingresa tu correo"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/20 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-secondary text-primary font-bold py-3 px-6 rounded-md relative overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex justify-center items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Autenticando...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
        
        {/* Herramientas de depuración - Solo visibles en modo desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-sm text-gray-400 font-semibold mb-3">Herramientas de Depuración</h3>
            <div className="flex flex-col space-y-2">
              <button 
                onClick={handleTestDBConnection}
                disabled={loading}
                className="bg-blue-500/30 hover:bg-blue-500/50 text-blue-100 text-xs py-2 px-3 rounded-md transition-colors"
              >
                Verificar Conexión a DB
              </button>
            </div>
          </div>
        )}
        
        {/* Sección de información de depuración - solo se muestra en desarrollo */}
        {debugInfo && process.env.NODE_ENV === 'development' && (
          <div className="mt-6 text-xs text-gray-400 border-t border-gray-700 pt-4">
            <p className="font-semibold mb-1">Información de depuración:</p>
            <pre className="bg-black/30 p-2 rounded overflow-auto max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Acceso restringido solo para personal autorizado.</p>
        </div>
      </div>
    </div>
  );
}