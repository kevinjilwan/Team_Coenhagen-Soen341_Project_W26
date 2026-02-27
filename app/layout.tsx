import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import SiteHeader from "@/components/ui/site-Header";
import AppShell from "@/components/ui/AppShell";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "A Meal Prep And Healthy Living Planner",
  description: "A Meal Planner",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gradient-to-b from-stone-200 to-amber-100 flex flex-col">
            <SiteHeader />

            <AppShell>
              <main className="flex-1">{children}</main>
            </AppShell>

          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}