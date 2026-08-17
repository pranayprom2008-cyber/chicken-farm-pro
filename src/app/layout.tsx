import type { Metadata } from "next";
import "./globals.css";
import ThemeInitializer from "@/components/ThemeInitializer";

export const metadata: Metadata = {
  title: "ChickFarm Pro - Commercial Chicken Farm Management",
  description:
    "A modern, premium chicken farm management platform with real-time analytics, batch tracking, expense management, and comprehensive reporting.",
  keywords:
    "chicken farm, poultry management, farm software, batch tracking, livestock management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('chickfarm-master-persistence-v3');
                if (stored) {
                  const parsed = JSON.parse(stored);
                  const theme = parsed?.state?.theme;
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark', 'liquid', 'liquid-glass', 'obsidian', 'spatial', 'spatial-glass');
                    document.documentElement.classList.add('light');
                  } else if (theme === 'spatial' || theme === 'spatial-glass') {
                    document.documentElement.classList.remove('light', 'liquid', 'liquid-glass', 'obsidian');
                    document.documentElement.classList.add('spatial', 'spatial-glass', 'dark');
                  } else if (theme === 'liquid' || theme === 'obsidian' || theme === 'liquid-glass') {
                    document.documentElement.classList.remove('dark', 'light', 'spatial', 'spatial-glass');
                    document.documentElement.classList.add('liquid', 'liquid-glass', 'obsidian', 'dark');
                  } else {
                    document.documentElement.classList.remove('light', 'liquid', 'liquid-glass', 'obsidian', 'spatial', 'spatial-glass');
                    document.documentElement.classList.add('dark');
                  }
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className="antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-500" suppressHydrationWarning>
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
