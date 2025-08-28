import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";

import { TRPCReactProvider } from "~/trpc/react";

import { ModalProvider } from "~/components/modal/provider";

import "~/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Demo Night App | The AI Collective",
    template: "%s | Demo Night App",
  },
  description:
    "The premier platform for showcasing innovative demos, connecting builders, and discovering the next big ideas in technology.",
  keywords: [
    "demo night",
    "technology showcase",
    "innovation",
    "startup demos",
    "product demos",
    "tech presentations",
    "developer showcase",
    "innovation platform",
    "startup pitch",
    "technology demos",
    "demo platform",
    "innovation showcase",
    "tech community",
    "product launch",
    "startup events",
    "demo competition",
    "technology exhibition",
    "innovation events",
    "demo presentations",
    "tech innovation",
  ],
  authors: [{ name: "The AI Collective" }],
  creator: "The AI Collective",
  publisher: "The AI Collective",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Demo Night App | The AI Collective",
    description:
      "The premier platform for showcasing innovative demos, connecting builders, and discovering the next big ideas in technology.",
    siteName: "Demo Night App",
    images: [
      {
        url: "/opengraph-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Demo Night App - The AI Collective",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Demo Night App | The AI Collective",
    description:
      "The premier platform for showcasing innovative demos, connecting builders, and discovering the next big ideas in technology.",
    images: ["/opengraph-image.jpeg"],
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Technology",
  classification: "Demo Platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  themeColor: "#fff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${kallisto.variable} ${openSans.variable} ${marker.variable} font-sans`}
    >
      <body>
        <TRPCReactProvider>
          <Toaster position="top-center" />
          <ModalProvider>{children}</ModalProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

const kallisto = localFont({
  src: [
    {
      path: "../../public/fonts/Kallisto/Kallisto Thin.otf",
      weight: "300",
    },
    {
      path: "../../public/fonts/Kallisto/Kallisto Thin Italic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/Kallisto/Kallisto Light.otf",
      weight: "400",
    },
    {
      path: "../../public/fonts/Kallisto/Kallisto Light Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Kallisto/Kallisto Medium.otf",
      weight: "500",
    },
    {
      path: "../../public/fonts/Kallisto/Kallisto Medium Italic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/Kallisto/Kallisto Bold.otf",
      weight: "600",
    },
    {
      path: "../../public/fonts/Kallisto/Kallisto Bold Italic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/Kallisto/Kallisto Heavy.otf",
      weight: "700",
    },
    {
      path: "../../public/fonts/Kallisto/Kallisto Heavy Italic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-kallisto",
});

const marker = localFont({
  src: "../../public/fonts/Kallisto/EdsMarketBoldSlant.otf",
  display: "swap",
  variable: "--font-marker",
});
