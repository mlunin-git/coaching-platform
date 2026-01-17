import type { Metadata } from "next";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PerformanceMonitoringProvider } from "@/components/PerformanceMonitoringProvider";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Safe Space - Coaching Platform",
  description: "Simple and secure coaching platform for managing clients and tasks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PerformanceMonitoringProvider>
          <AnalyticsProvider>
            <LanguageProvider>
              <div className="flex flex-col min-h-screen">
                <Navigation />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </LanguageProvider>
          </AnalyticsProvider>
        </PerformanceMonitoringProvider>
      </body>
    </html>
  );
}
