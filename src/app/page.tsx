import HeroSection from '../components/HeroSection'
import AboutSection from '../components/AboutSection'
import GallerySection from '../components/GallerySection'
import GenresSection from '../components/GenresSection'
// MusicPlayer ya está incluido dentro de HeroSection, no es necesario importarlo aquí
import ContactSection from '../components/ContactSection'
import RedesSociales from '../components/RedesSociales'
import ScrollAnimations from '../components/ScrollAnimations'

export default function Home() {
  return (
    <>
      <ScrollAnimations />
      <HeroSection />
      <AboutSection />
      <GallerySection />
      <GenresSection />
      <RedesSociales />
      <ContactSection />
    </>
  )
}