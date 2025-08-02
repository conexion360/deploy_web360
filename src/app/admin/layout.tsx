// src/app/admin/layout.tsx
import '../../app/globals.css';
import '../../app/galeria.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AdminHead from './components/AdminHead';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin - Conexion 360 SAC',
  description: 'Panel de administración de Conexion 360 SAC',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AdminHead />
        {children}
      </body>
    </html>
  );
}