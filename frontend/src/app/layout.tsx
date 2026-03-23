import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatWidget } from "@/components/ai/ChatWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillForge",
  description: "A full-stack LMS built with Next.js and Express",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans max-w-[100vw] overflow-x-hidden")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProtectedRoute>
            {children}
            <ChatWidget />
          </ProtectedRoute>
        </ThemeProvider>
      </body>
    </html>
  );
}
