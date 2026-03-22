import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Footer } from "@/components/Footer";
export const metadata: Metadata = {
  title: "RecME – Discover Your Next Favorite Movie",
  description:
    "AI-powered movie recommendations tailored to your mood, powered by advanced neural engines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "857890854436-7bo0rjv0peum3gdsc24641bv51r7d5p6.apps.googleusercontent.com"}>
            {children}
            <Footer />
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
