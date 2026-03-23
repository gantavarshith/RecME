"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Decide if we want to show the navbar on this specific path
  // For RecME, the user seems to want it everywhere for consistency
  const showNavbar = true; 

  return (
    <AuroraBackground showRadialGradient={true} className="flex-col !justify-start !items-stretch">
      {showNavbar && <Navbar />}
      <div className="flex-1 w-full relative">
        {children}
      </div>
      <Footer />
      <Toaster position="bottom-right" richColors />
    </AuroraBackground>
  );
}
