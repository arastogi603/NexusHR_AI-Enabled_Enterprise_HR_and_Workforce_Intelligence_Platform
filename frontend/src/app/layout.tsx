import type { Metadata } from "next";
import { VerticalNav } from "@/components/layout/VerticalNav";
import { ThemeProvider } from "@/lib/theme/theme";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import "./globals.css";

import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { NexusAiChatWidget } from "@/components/ai/NexusAiChatWidget";
import { PageTransition } from "@/components/layout/PageTransition";

const poppins = {
  variable: "--font-poppins",
  className: "font-sans",
};

const geist = {
  variable: "--font-geist",
  className: "font-sans",
};

export const metadata: Metadata = {
  title: "NexusHR — Enterprise HR Platform",
  description: "AI-Enabled Enterprise HR & Workforce Intelligence Platform",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={cn("h-full", "antialiased", "dark", poppins.variable, geist.variable, poppins.className, "font-sans")}
      suppressHydrationWarning
    >
      <body className={cn(poppins.className, "min-h-[100dvh] lg:h-screen w-full lg:w-screen bg-[#eaf0f8] text-slate-900 dark:bg-[#07090e] dark:text-white flex flex-col relative overflow-x-hidden lg:overflow-hidden select-none transition-colors duration-300")}>
        <ThemeProvider>
          <AuthProvider>
            <Toaster position="top-right" />

            {/* Ambient Background Glows (visible blurry through the big glass block) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
              <div className="absolute -top-36 right-1/4 w-[650px] h-[650px] bg-gradient-to-br from-amber-400/20 to-orange-500/20 dark:from-orange-500/12 dark:to-amber-500/10 rounded-full blur-[140px]" />
              <div className="absolute top-1/3 -left-28 w-[600px] h-[600px] bg-gradient-to-tr from-amber-600/15 to-orange-600/15 dark:from-orange-600/10 dark:to-amber-600/8 rounded-full blur-[150px]" />
              <div className="absolute -bottom-36 right-10 w-[550px] h-[550px] bg-gradient-to-tl from-amber-500/15 to-orange-500/15 dark:from-amber-500/10 dark:to-orange-500/8 rounded-full blur-[130px]" />
            </div>

            {/* Ambient Drifting Wall behind the glass frame */}
            <AmbientBackground />

            {/* RESPONSIVE VIEWPORT: Single Frame on desktop, smooth fluid scroll on Android/mobile */}
            <main className="relative z-10 w-full lg:w-screen min-h-[100dvh] lg:h-screen overflow-x-hidden lg:overflow-hidden p-2 sm:p-2.5 lg:p-3 flex flex-col lg:flex-row items-center justify-center gap-2.5 lg:gap-3 box-border pb-20 lg:pb-3">
              {/* Detached Groovy Vertical Dock Navigation (Stationary on desktop, floating dock on mobile) */}
              <VerticalNav />

              {/* THE UNIFIED BIG GLASS BOX (Responsive Frame Container) */}
              <div className="big-glass-frame flex-1 w-full lg:w-auto min-h-[calc(100dvh-100px)] lg:h-full lg:max-h-[calc(100vh-16px)] rounded-[24px] sm:rounded-[34px] lg:rounded-[42px] flex flex-col overflow-hidden relative shadow-2xl">
                {/* Main Content inside the big glass box - Scrollable on mobile, static on desktop */}
                <div className="flex-1 w-full h-full flex flex-col overflow-y-auto lg:overflow-hidden p-2.5 sm:p-3.5 lg:p-4.5 box-border">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </div>
              </div>

              {/* Floating Global AI Assistant Widget */}
              <NexusAiChatWidget />
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
