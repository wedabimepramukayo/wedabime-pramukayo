import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Wedabime Pramukayo | Premium i-Panel & Home Improvement Solutions Sri Lanka",
    template: "%s | Wedabime Pramukayo",
  },
  description:
    "Wedabime Pramukayo - Sri Lanka's trusted provider of premium i-Panel ceiling systems, wall cladding, and roofing solutions. Fire-retardant, waterproof, termite-proof with up to 15 years warranty.",
  keywords: [
    "Wedabime Pramukayo",
    "i-Panel Sri Lanka",
    "ceiling systems",
    "wall cladding",
    "roofing solutions",
    "home improvement Sri Lanka",
    "construction materials",
    "fire retardant panels",
    "waterproof ceiling",
    "termite proof",
    "Click-it System",
    "Eltoro Ceiling",
    "Luxury Wall Series",
  ],
  authors: [{ name: "Wedabime Pramukayo" }],
  creator: "Wedabime Pramukayo",
  publisher: "Wedabime Pramukayo",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: "https://wedabimepramukayo.site",
    siteName: "Wedabime Pramukayo",
    title: "Wedabime Pramukayo | Premium i-Panel & Home Improvement Solutions",
    description:
      "Sri Lanka's trusted provider of premium i-Panel ceiling systems, wall cladding, and roofing. Fire-retardant, waterproof, termite-proof. Up to 15 years warranty.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedabime Pramukayo | Premium i-Panel Solutions",
    description:
      "Sri Lanka's trusted provider of premium i-Panel ceiling systems, wall cladding, and roofing solutions.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
