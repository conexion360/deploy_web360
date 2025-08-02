// src/app/admin/mensajes/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

interface Mensaje {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  mensaje: string;
  leido: boolean;
  respondido: boolean;
  fecha_creacion: string;
  fecha_lectura: string | null;
  fecha_respuesta: string | null;
}

export default function MensajesAdmin() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Mensaje | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Cargar los mensajes
  useEffect(() => {
    const fetchMensajes = async () => {
      try {
        setLoading(true);
        
        // Construir la URL según el filtro
        let url = '/api/mensajes';
        if (filter === 'unread') {
          url += '?leido=false';
        } else if (filter === 'read') {
          url += '?leido=true';
        }
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los mensajes');
        }
        
        const data = await response.json();
        setMensajes(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('No se pudieron cargar los mensajes. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMensajes();
  }, [filter]);

  const handleOpenMessage = async (mensaje: Mensaje) => {
    try {
      // Marcar como leído si no lo estaba
      if (!mensaje.leido) {
        const response = await fetch(`/api/mensajes/${mensaje.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({
            leido: true
          })
        });
        
        if (!response.ok) {
          throw new Error('Error al marcar el mensaje como leído');
        }
        
        // Actualizar el estado local
        setMensajes(mensajes.map(m => 
          m.id === mensaje.id ? { ...m, leido: true, fecha_lectura: new Date().toISOString() } : m
        ));
      }
      
      setSelectedMessage(mensaje);
    } catch (error) {
      console.error('Error opening message:', error);
      setError('No se pudo marcar el mensaje como leído. Por favor, intenta de nuevo.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMarkAsResponded = async (id: number) => {
    try {
      const response = await fetch(`/api/mensajes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          respondido: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al marcar el mensaje como respondido');
      }
      
      // Actualizar el estado local
      setMensajes(mensajes.map(m => 
        m.id === id ? { ...m, respondido: true, fecha_respuesta: new Date().toISOString() } : m
      ));
      
      // Actualizar el mensaje seleccionado si es el mismo
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({
          ...selectedMessage,
          respondido: true,
          fecha_respuesta: new Date().toISOString()
        });
      }
      
      setSuccess('Mensaje marcado como respondido');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error marking message as responded:', error);
      setError('No se pudo marcar el mensaje como respondido. Por favor, intenta de nuevo.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/mensajes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar el mensaje');
        }
        
        // Actualizar el estado local
        setMensajes(mensajes.filter(m => m.id !== id));
        
        // Cerrar el mensaje seleccionado si es el mismo
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
        
        setSuccess('Mensaje eliminado correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting message:', error);
        setError('No se pudo eliminar el mensaje. Por favor, intenta de nuevo.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Formato de fecha legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mensajes de Contacto</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'all'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'unread'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              No leídos
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'read'
                  ? 'bg-secondary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Leídos
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Lista de mensajes */}
            <div className="w-full md:w-1/3 bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Mensajes {filter === 'unread' ? 'no leídos' : filter === 'read' ? 'leídos' : ''}
                </h2>
              </div>
              
              {mensajes.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">
                    No hay mensajes {filter === 'unread' ? 'no leídos' : filter === 'read' ? 'leídos' : ''}.
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  {mensajes.map(mensaje => (
                    <div 
                      key={mensaje.id}
                      className={`border-b border-gray-200 p-4 cursor-pointer transition-colors ${
                        selectedMessage?.id === mensaje.id 
                          ? 'bg-blue-50' 
                          : !mensaje.leido 
                            ? 'bg-yellow-50 hover:bg-yellow-100' 
                            : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleOpenMessage(mensaje)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-medium ${!mensaje.leido ? 'font-bold' : ''}`}>
                            {mensaje.nombre}
                          </h3>
                          <p className="text-sm text-gray-500">{mensaje.email}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!mensaje.leido && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          {mensaje.respondido && (
                            <span className="material-icons-outlined text-green-500 text-sm">
                              check_circle
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {mensaje.mensaje}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(mensaje.fecha_creacion)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Detalle del mensaje */}
            <div className="w-full md:w-2/3 bg-white rounded-lg shadow overflow-hidden">
              {selectedMessage ? (
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Mensaje de {selectedMessage.nombre}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {!selectedMessage.respondido ? (
                        <button
                          onClick={() => handleMarkAsResponded(selectedMessage.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors"
                        >
                          Marcar como respondido
                        </button>
                      ) : (
                        <span className="text-green-500 text-sm flex items-center">
                          <span className="material-icons-outlined text-sm mr-1">check_circle</span>
                          Respondido
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage.id)}
                        className="text-red-500 p-1 rounded hover:bg-red-50"
                        title="Eliminar mensaje"
                      >
                        <span className="material-icons-outlined">delete</span>
                      </button>
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="text-gray-500 p-1 rounded hover:bg-gray-100 md:hidden"
                        title="Cerrar"
                      >
                        <span className="material-icons-outlined">close</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                        <p>{selectedMessage.nombre}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p>
                          <a href={`mailto:${selectedMessage.email}`} className="text-blue-500 hover:underline">
                            {selectedMessage.email}
                          </a>
                        </p>
                      </div>
                      {selectedMessage.telefono && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                          <p>
                            <a href={`tel:${selectedMessage.telefono}`} className="text-blue-500 hover:underline">
                              {selectedMessage.telefono}
                            </a>
                          </p>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Fecha</h3>
                        <p>{formatDate(selectedMessage.fecha_creacion)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Mensaje</h3>
                      <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                        {selectedMessage.mensaje}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {selectedMessage.leido && (
                        <p>Leído: {formatDate(selectedMessage.fecha_lectura || '')}</p>
                      )}
                      {selectedMessage.respondido && (
                        <p>Respondido: {formatDate(selectedMessage.fecha_respuesta || '')}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: Mensaje desde Conexion 360`}
                        className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-light transition-colors"
                      >
                        Responder por email
                      </a>
                      {selectedMessage.telefono && (
                        <a
                          href={`https://wa.me/${selectedMessage.telefono.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <span className="material-icons-outlined text-4xl text-gray-300">email</span>
                    <p className="mt-2 text-gray-500">Selecciona un mensaje para ver su contenido</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}