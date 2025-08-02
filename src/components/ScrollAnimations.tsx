"use client"
import { useEffect } from 'react'

export default function ScrollAnimations() {
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.reveal-on-scroll')
      
      elements.forEach(element => {
        const position = element.getBoundingClientRect()
        
        // Revela el elemento cuando está a 150px de entrar en la pantalla
        if (position.top < window.innerHeight - 150) {
          element.classList.add('visible')
        }
      })
    }
    
    // Ejecutar una vez al cargar para los elementos que ya están visibles
    handleScroll()
    
    // Agregar el evento de scroll
    window.addEventListener('scroll', handleScroll)
    
    // Limpiar al desmontar
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  
  return null
}