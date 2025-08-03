// app/layout.tsx
import './globals.css';
import './galeria.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import NavBar from '@/components/NavBar';
import FooterSection from '@/components/FooterSection';
import DynamicHead from '@/components/DynamicHead';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Conexion 360 SAC',
  description: 'Sitio web oficial de Conexion 360 SAC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <DynamicHead />
      <body className={inter.className}>
        {/* NavBar se incluye una sola vez en el layout raíz */}
        <NavBar />
        <main>{children}</main>
        <FooterSection />
      </body>
    </html>
  );
}