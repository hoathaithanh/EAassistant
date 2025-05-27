
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import Image from "next/image";
import { useLanguage } from "@/components/providers";

export default function AppHeader() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 max-w-screen-2xl items-center">
        <div className="mr-4 flex flex-col items-start">
          {/*
            ====================================================================
            IMPORTANT - LOGO DISPLAY NOTES:
            ====================================================================
            1. IMAGE SOURCE:
               The image source is an SVG URL. Ensure your internet
               connection is active to load it. 

            2. NEXT.CONFIG.JS:
               The hostname 'vets.energy' needs to be added to
               next.config.ts remotePatterns to allow Next.js to optimize this image
               if it wasn't already from a previous configuration.
               (Assuming 'images.unsplash.com' and 'placehold.co' are already there).

            3. IMAGE DIMENSIONS:
               The 'width' and 'height' props (e.g., 180x40) are crucial.
               They should match the *actual intrinsic dimensions* of your logo image
               for optimal performance and to prevent layout shift. Next.js uses these
               for aspect ratio calculation and optimization. The className
               'h-10 w-auto' controls the displayed size on the page.

            4. TROUBLESHOOTING:
               - Check your browser's developer console (Network tab) for errors loading the image.
               - Verify the URL is correct and accessible.
               - Restart your Next.js development server (npm run dev) after
                 any changes to 'next.config.ts'.
            ====================================================================
          */}
          <Image
            src="https://vets.energy/wp-content/themes/vetsenergy/images/logo-vets-ee.svg"
            alt="Vets Energy and Environment Logo"
            width={180} // Intrinsic width of the logo SVG
            height={40} // Intrinsic height of the logo SVG
            className="h-10 w-auto" // Controls displayed size
            data-ai-hint="company logo"
            priority // Preloads the logo as it's LCP.
          />
          <h1 className="mt-0.5 text-xs font-semibold text-primary">
            {t('appName')}
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}

