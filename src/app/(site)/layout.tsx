// app/(site)/layout.tsx
import NavBar from '@/components/NavBar';
import FooterSection from '@/components/FooterSection';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
      <FooterSection />
    </>
  );
}