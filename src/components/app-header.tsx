
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import Image from "next/image";
import { useLanguage } from "@/components/providers"; // Added if t('appName') is used, but it's not in this version.

export default function AppHeader() {
  // const { t } = useLanguage(); // Not strictly needed if t('appName') is removed/not used

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          {/*
            ====================================================================
            IMPORTANT - LOGO DISPLAY NOTES:
            ====================================================================
            1. IMAGE SOURCE:
               The image source is now an Unsplash URL. Ensure your internet
               connection is active to load it.

            2. NEXT.CONFIG.JS:
               The hostname 'images.unsplash.com' has been added to
               next.config.ts remotePatterns to allow Next.js to optimize this image.

            3. IMAGE DIMENSIONS:
               The 'width' and 'height' props (180x40) are used by Next.js
               for aspect ratio calculation and optimization. The className
               'h-10 w-auto' controls the displayed size.

            4. TROUBLESHOOTING:
               - Restart your Next.js development server (npm run dev) after
                 any changes to next.config.ts.
               - Open your browser's developer console (usually F12). Check the
                 'Network' tab for any errors loading the image from Unsplash.
               - Ensure 'images.unsplash.com' is reachable from your network.
            ====================================================================
          */}
          <Image
            src="https://images.unsplash.com/photo-1556020685-ae41abfc9365?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxOHx8JTJGaG9tZSUyRnVzZXIlMkZzdHVkaW8lMkZMb2dvJTIwVkVUUy1uZXcucG5nfGVufDB8fHx8MTc0ODMzNzY2MHww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Vets Energy and Environment Logo"
            width={180}
            height={40}
            className="h-10 w-auto"
            data-ai-hint="company logo"
            priority // Preloads the logo as it's likely LCP (Largest Contentful Paint).
          />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
