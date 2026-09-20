import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import {
  isThemeAccent,
  isThemeMode,
  THEME_ACCENT_COOKIE,
  THEME_INIT_SCRIPT,
  THEME_MODE_COOKIE,
} from "@/lib/theme";
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
  title: "Ascend — Personal Training, In Your Pocket",
  description: "Structured workouts, live coaching, and progress tracking.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ascend",
  },
};

export const viewport: Viewport = {
  themeColor: "#6d28d9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const modeCookie = cookieStore.get(THEME_MODE_COOKIE)?.value;
  const accentCookie = cookieStore.get(THEME_ACCENT_COOKIE)?.value;
  const mode = isThemeMode(modeCookie) ? modeCookie : "system";
  const accent = isThemeAccent(accentCookie) ? accentCookie : "violet";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-theme={mode === "system" ? undefined : mode}
      data-accent={accent === "violet" ? undefined : accent}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
