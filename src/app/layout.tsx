import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://k.animovie.uz'),
  title: {
    default: "AnimeKO.uz — O‘zbekcha Anime va Manga Portali",
    template: "%s | AnimeKO.uz",
  },
  description: "Eng sara yapon animelari, mangalari va koreys manxvalari o'zbek tilida, bepul va yuqori sifatda.",
  keywords: [
    "animeko", "animeko.uz", "k.animovie.uz", "animovie", "anime uzbekcha", 
    "manga o'zbek tilida", "uzmanga", "manxva uzbek", "solo leveling uzbekcha", "naruto uzbekcha"
  ],
  authors: [{ name: "AnimeKO Team" }],
  creator: "AnimeKO",
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: "https://k.animovie.uz",
    siteName: "AnimeKO.uz",
    title: "AnimeKO.uz — O‘zbekcha Anime va Manga Portali",
    description: "Eng sara yapon animelari, mangalari va koreys manxvalari o'zbek tilida, bepul va yuqori sifatda.",
    images: [
      {
        url: "/animeko-logo.jpg",
        width: 1024,
        height: 1024,
        alt: "AnimeKO.uz Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AnimeKO.uz — O‘zbekcha Anime va Manga Portali",
    description: "Eng sara yapon animelari, mangalari va koreys manxvalari o'zbek tilida.",
    images: ["/animeko-logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/animeko-logo.jpg' },
    ],
    apple: '/apple-icon.jpg',
    shortcut: '/favicon.ico',
  },
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
