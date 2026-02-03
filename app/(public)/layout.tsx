import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventPopup from '@/components/EventPopup';


export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <EventPopup />           {/* ← popup lives here */}

      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}