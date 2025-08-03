// src/lib/auth-refresh.ts
// Sistema para refrescar el token automáticamente

export async function refreshAuthToken() {
  try {
    // Obtener el token actual
    const currentToken = localStorage.getItem('adminToken');
    const currentUser = localStorage.getItem('adminUser');
    
    if (!currentToken || !currentUser) {
      throw new Error('No hay sesión activa');
    }
    
    // Decodificar el token para ver si está por expirar
    const tokenParts = currentToken.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));
    const expirationTime = payload.exp * 1000; // Convertir a milisegundos
    const currentTime = Date.now();
    
    // Si el token expira en menos de 30 minutos, renovarlo
    if (expirationTime - currentTime < 30 * 60 * 1000) {
      // Aquí podrías implementar un endpoint de refresh
      // Por ahora, simplemente indicamos que se debe volver a iniciar sesión
      console.log('Token a punto de expirar, por favor vuelve a iniciar sesión');
      
      // Limpiar el almacenamiento
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Redirigir al login
      window.location.href = '/admin/login';
    }
    
    return true;
  } catch (error) {
    console.error('Error al verificar token:', error);
    return false;
  }
}

// Hook para usar en componentes React
export function useAuthCheck() {
  useEffect(() => {
    // Verificar el token al cargar el componente
    refreshAuthToken();
    
    // Verificar cada 5 minutos
    const interval = setInterval(refreshAuthToken, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
}