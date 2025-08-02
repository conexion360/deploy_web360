"use client"
import React, { useState } from 'react';

const ContactSection: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulando envío de formulario
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      setForm({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <section id="contacto" className="section-padding bg-gradient-to-b from-primary to-primary-dark text-white py-32">
      <div className="container mx-auto max-w-5xl px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 reveal-on-scroll">
          <span className="text-secondary">Contáctanos</span>
        </h2>
        <div className="w-20 h-1 bg-secondary mx-auto mb-8 reveal-on-scroll"></div>
        <p className="text-gray-300 max-w-2xl mx-auto mb-12 reveal-on-scroll">
          ¿Listo para organizar tu próximo evento? Déjanos tus datos y nos pondremos en contacto contigo 
          para hacer realidad tu visión.
        </p>
        
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="text-left reveal-on-scroll">
            <h3 className="text-2xl font-semibold mb-6">Información de Contacto</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-secondary/20 p-3 rounded-full mr-4">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Email</h4>
                  <p className="text-gray-300">gerencia@conexion360sac.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white/10 rounded-lg p-6 shadow-xl text-left reveal-on-scroll">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-white font-medium mb-2">Nombre completo</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-white font-medium mb-2">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Tu correo electrónico"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-white font-medium mb-2">Teléfono</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="+51 XXX-XXX-XXX"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-white font-medium mb-2">Mensaje</label>
                <textarea 
                  id="message" 
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4} 
                  className="w-full bg-white/5 border border-white/20 rounded-md px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Cuéntanos sobre tu evento..."
                  required
                ></textarea>
              </div>
              
              <div className="text-center">
                <button 
                  type="submit" 
                  className="btn-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    "Enviar mensaje"
                  )}
                </button>
                
                {isSuccess && (
                  <div className="mt-4 bg-green-800/30 border border-green-700 text-green-300 rounded-md p-4 animate-fade-in">
                    ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo lo antes posible.
                  </div>
                )}
                
                {errorMessage && (
                  <div className="mt-4 bg-red-800/30 border border-red-700 text-red-300 rounded-md p-4 animate-fade-in">
                    {errorMessage}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;