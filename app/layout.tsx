import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Landscape Evidence | CIMMYT · CGIAR",
  description: "Explore CGIAR programs and initiatives and connect studies, countries, agroecological principles and outcomes across landscapes and food systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: `(function(){var theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';try{var saved=localStorage.getItem('evidence-theme');if(saved==='light'||saved==='dark')theme=saved;}catch(e){}document.documentElement.dataset.theme=theme;})();` }} /></head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
