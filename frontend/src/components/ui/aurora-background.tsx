"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps {
  children: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950",
        className
      )}
    >
      {/* Aurora layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            backgroundImage: [
              "repeating-linear-gradient(100deg, #fff 0%, #fff 7%, transparent 10%, transparent 12%, #fff 16%)",
              "repeating-linear-gradient(100deg, #3b82f6 10%, #a5b4fc 15%, #93c5fd 20%, #ddd6fe 25%, #60a5fa 30%)",
            ].join(", "),
            backgroundSize: "300%, 200%",
            backgroundPosition: "50% 50%, 50% 50%",
            filter: "blur(40px)",
          }}
          className={cn(
            "absolute -inset-[10px] opacity-70 dark:opacity-0 will-change-transform animate-aurora",
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]"
          )}
        />
        {/* Dark mode aurora */}
        <div
          style={{
            backgroundImage: [
              "repeating-linear-gradient(100deg, #000 0%, #000 7%, transparent 10%, transparent 12%, #000 16%)",
              "repeating-linear-gradient(100deg, #3b82f6 10%, #a5b4fc 15%, #93c5fd 20%, #ddd6fe 25%, #60a5fa 30%)",
            ].join(", "),
            backgroundSize: "300%, 200%",
            backgroundPosition: "50% 50%, 50% 50%",
            filter: "blur(10px)",
          }}
          className={cn(
            "absolute -inset-[10px] opacity-0 dark:opacity-50 will-change-transform animate-aurora",
            showRadialGradient &&
              "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]"
          )}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
