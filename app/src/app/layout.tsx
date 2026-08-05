import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "LOGAN OS — Sistema operativo de IA",
  description:
    "LOGAN OS coordina múltiples roles de IA (Core, Memory, Marketing, Dev, Design, Analytics, Finance, Legal, Support) para crear, administrar y hacer crecer empresas y aplicaciones. Cada rol deja constancia de por qué decidió; el sistema aprende de sus propios resultados.",
  keywords: [
    "LOGAN",
    "LOGAN OS",
    "Sistema operativo de IA",
    "metodología LOGAN",
    "orquestación de IA",
    "hipótesis verificables",
  ],
  authors: [{ name: "LOGAN OS" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "LOGAN OS",
    description: "Sistema operativo de IA · coordina roles, aprende de sus resultados.",
    siteName: "LOGAN OS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LOGAN OS",
    description: "Sistema operativo de IA · coordina roles, aprende de sus resultados.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
