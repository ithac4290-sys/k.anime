import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

export const metadata: Metadata = {
  title: "AnimeKO.uz — Anime & Manga olami | O'zbek tilida",
  description: "Eng sara yapon animelari, mangalari va koreys manxvalari o'zbek tilida, bepul va yuqori sifatda.",
  keywords: ["animeko", "animeko.uz", "anime uzbekcha", "manga o'zbek tilida", "uzmanga", "manxva uzbek", "solo leveling uzbekcha", "naruto uzbekcha"],
  icons: {
    icon: '/animeko-logo.jpg',
    apple: '/animeko-logo.jpg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className="antialiased min-h-screen flex flex-col bg-[#0d0e12] text-gray-100 selection:bg-red-600 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
            {children}
          </main>
          <Footer />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
