// app/(admin)/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No incluimos NavBar ni FooterSection aquí
  // El contenido de children será el componente AdminLayout 
  // que ya tienes definido en src/app/admin/components/AdminLayout.tsx
  return children;
}