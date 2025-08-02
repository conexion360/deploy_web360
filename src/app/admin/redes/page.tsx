// src/app/admin/redes/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';

interface RedSocial {
  id: number;
  nombre: string;
  url: string;
  icono: string;
  username: string | null;
  color: string | null;
  orden: number;
  activo: boolean;
}

export default function RedesSocialesAdmin() {
  const [redes, setRedes] = useState<RedSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para el formulario de nueva red social
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    url: '',
    icono: '',
    username: '',
    color: '#1DA1F2', // Color predeterminado (azul Twitter)
    orden: 1,
    activo: true
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Cargar las redes sociales
  useEffect(() => {
    const fetchRedes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/redes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar las redes sociales');
        }
        
        const data = await response.json();
        setRedes(data);
        
        // Establecer el siguiente orden para el formulario
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            orden: Math.max(...data.map((red: RedSocial) => red.orden)) + 1
          }));
        }
      } catch (error) {
        console.error('Error fetching social networks:', error);
        setError('No se pudieron cargar las redes sociales. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRedes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      // Encontrar la red social actual
      const red = redes.find(r => r.id === id);
      if (!red) return;
      
      // Actualizar en la API
      const response = await fetch(`/api/redes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...red,
          activo: !red.activo
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la red social');
      }
      
      // Actualizar el estado local
      setRedes(redes.map(red => 
        red.id === id ? { ...red, activo: !red.activo } : red
      ));
      
      setSuccess('Red social actualizada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling active state:', error);
      setError('No se pudo actualizar la red social. Por favor, intenta de nuevo.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditRed = (red: RedSocial) => {
    setFormData({
      nombre: red.nombre,
      url: red.url,
      icono: red.icono,
      username: red.username || '',
      color: red.color || '#1DA1F2',
      orden: red.orden,
      activo: red.activo
    });
    setEditingId(red.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/redes/${editingId}` : '/api/redes';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Error al ${editingId ? 'actualizar' : 'crear'} la red social`);
      }
      
      const data = await response.json();
      
      if (editingId) {
        // Actualizar en el estado local
        setRedes(redes.map(red => red.id === editingId ? data : red));
        setSuccess('Red social actualizada correctamente');
      } else {
        // Agregar la nueva red social al estado local
        setRedes([...redes, data]);
        setSuccess('Red social creada correctamente');
      }
      
      // Limpiar el formulario
      setFormData({
        nombre: '',
        url: '',
        icono: '',
        username: '',
        color: '#1DA1F2',
        orden: Math.max(...redes.map(red => red.orden), 0) + 1,
        activo: true
      });
      setEditingId(null);
      setShowForm(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || `Error al ${editingId ? 'actualizar' : 'crear'} la red social`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta red social? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/redes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar la red social');
        }
        
        // Actualizar el estado local
        setRedes(redes.filter(red => red.id !== id));
        
        setSuccess('Red social eliminada correctamente');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting social network:', error);
        setError('No se pudo eliminar la red social. Por favor, intenta de nuevo.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Redes Sociales</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-secondary-light transition-colors"
          >
            <span className="material-icons-outlined">{showForm ? 'close' : 'add'}</span>
            <span>{showForm ? 'Cancelar' : 'Nueva Red Social'}</span>
          </button>
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
        
        {/* Formulario para agregar/editar red social */}
        {showForm && (
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <form onSubmit={handleSubmit} className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {editingId ? 'Editar Red Social' : 'Nueva Red Social'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    required
                    placeholder="Facebook, Instagram, etc."
                  />
                </div>
                
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    required
                    placeholder="https://www.facebook.com/conexion360"
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username (opcional)
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    placeholder="@conexion360"
                  />
                </div>
                
                <div>
                  <label htmlFor="icono" className="block text-sm font-medium text-gray-700 mb-1">
                    Icono
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      id="icono"
                      name="icono"
                      value={formData.icono}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      required
                      placeholder="facebook, instagram, etc."
                    />
                    {formData.icono && (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: formData.color || '#1DA1F2' }}
                      >
                        <span className="material-icons-outlined text-white">
                          {formData.icono}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Nombre del icono de Material Icons
                  </p>
                </div>
                
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className="w-10 h-10 p-0 border-0"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={handleChange}
                      name="color"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      placeholder="#1DA1F2"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    id="orden"
                    name="orden"
                    value={formData.orden}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    required
                    min="1"
                  />
                </div>
                
                <div className="md:col-span-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activo"
                      name="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                    />
                    <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                      Activo
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      nombre: '',
                      url: '',
                      icono: '',
                      username: '',
                      color: '#1DA1F2',
                      orden: Math.max(...redes.map(red => red.orden), 0) + 1,
                      activo: true
                    });
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-4 hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-light transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    editingId ? 'Actualizar' : 'Guardar'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : redes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No hay redes sociales disponibles. Agrega una para comenzar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {redes.map(red => (
              <div key={red.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className={`h-2 w-full`} style={{ backgroundColor: red.color || '#1DA1F2' }}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: red.color || '#1DA1F2' }}
                      >
                        <span className="material-icons-outlined text-white text-2xl">
                          {red.icono}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{red.nombre}</h3>
                        {red.username && (
                          <p className="text-sm text-gray-500">{red.username}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleToggleActive(red.id)}
                        className={`p-1 rounded ${red.activo ? 'text-green-600' : 'text-red-600'}`}
                        title={red.activo ? 'Desactivar' : 'Activar'}
                      >
                        <span className="material-icons-outlined text-sm">
                          {red.activo ? 'check_circle' : 'cancel'}
                        </span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 truncate">
                      <a href={red.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {red.url}
                      </a>
                    </p>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditRed(red)}
                      className="p-1 rounded text-blue-600 hover:bg-blue-50"
                      title="Editar"
                    >
                      <span className="material-icons-outlined">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(red.id)}
                      className="p-1 rounded text-red-600 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <span className="material-icons-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}