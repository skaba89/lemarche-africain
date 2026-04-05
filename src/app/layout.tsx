import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { JsonLd, organizationSchema, webSiteSchema } from "@/components/JsonLd";
import ClientLayout from "@/components/layout/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lemarcheafricain.gn"),
  title: "Le March\u00e9 Africain \u2014 Le meilleur march\u00e9 en ligne d'Afrique",
  description:
    "Achetez sur Le March\u00e9 Africain. Produits \u00e9lectroniques, t\u00e9l\u00e9phones, accessoires et plus. Livraison Conakry et provinces. Paiement Orange Money, MTN MoMo, Wave.",
  keywords: [
    "Le March\u00e9 Africain",
    "Guin\u00e9e",
    "Conakry",
    "e-commerce Afrique",
    "Orange Money",
    "MTN MoMo",
    "Wave",
    "march\u00e9 en ligne",
    "t\u00e9l\u00e9phone pas cher",
    "\u00e9lectronique Guin\u00e9e",
    "livraison Conakry",
    "shopping Afrique",
  ],
  authors: [{ name: "Le March\u00e9 Africain" }],
  creator: "Le March\u00e9 Africain",
  publisher: "Le March\u00e9 Africain",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://lemarcheafricain.gn",
    siteName: "Le March\u00e9 Africain",
    title: "Le March\u00e9 Africain \u2014 Le meilleur march\u00e9 en ligne d'Afrique",
    description:
      "Achetez sur Le March\u00e9 Africain. Produits \u00e9lectroniques, t\u00e9l\u00e9phones, accessoires et plus. Livraison Conakry et provinces. Paiement mobile local.",
    images: [
      {
        url: "/product-images/headphones-main.png",
        width: 800,
        height: 800,
        alt: "Le March\u00e9 Africain",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Le March\u00e9 Africain \u2014 Le meilleur march\u00e9 en ligne d'Afrique",
    description:
      "Achetez sur Le March\u00e9 Africain. Produits \u00e9lectroniques, t\u00e9l\u00e9phones, accessoires et plus.",
    images: ["/product-images/headphones-main.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1B5E20" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="canonical" href="https://lemarcheafricain.gn" />
        <JsonLd data={organizationSchema} />
        <JsonLd data={webSiteSchema} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#1B5E20] focus:text-white focus:px-3 focus:py-1.5 focus:rounded-lg focus:outline-none"
        >
          Aller au contenu principal
        </a>
        <a
          href="#mobile-menu"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-56 focus:z-[100] focus:bg-[#1B5E20] focus:text-white focus:px-3 focus:py-1.5 focus:rounded-lg focus:outline-none"
        >
          Aller au menu mobile
        </a>
        <a
          href="#header-search"
          className="sr-only focus:not-sr-only focus:absolute focus:top-10 focus:left-2 focus:z-[100] focus:bg-[#1B5E20] focus:text-white focus:px-3 focus:py-1.5 focus:rounded-lg focus:outline-none"
        >
          Aller a la recherche
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
