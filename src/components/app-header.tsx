
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import Image from "next/image";

export default function AppHeader() {
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
               connection is active to load it. IF THIS FAILS, try placing
               your logo (e.g., 'Logo VETS-new.png') in the 'public' directory
               and changing src to '/Logo VETS-new.png'.

            2. NEXT.CONFIG.JS:
               The hostname 'images.unsplash.com' (and 'placehold.co') has been added to
               next.config.ts remotePatterns to allow Next.js to optimize this image.
               If using a local image from 'public', no config change is needed for that.

            3. IMAGE DIMENSIONS:
               The 'width' and 'height' props (e.g., 180x40) are crucial.
               They should match the *actual intrinsic dimensions* of your logo image
               for optimal performance and to prevent layout shift. Next.js uses these
               for aspect ratio calculation and optimization. The className
               'h-10 w-auto' controls the displayed size on the page.

            4. TROUBLESHOOTING:
               - If using Unsplash/Placeholder: Check your browser's developer console (Network tab) for errors loading the image.
               - If using local image (e.g., /Logo VETS-new.png):
                 - VERIFY: The image 'Logo VETS-new.png' is in the 'public' folder at the root of your project.
                 - EXACT FILENAME: Ensure the filename in 'src' matches EXACTLY (case-sensitive).
                 - Restart your Next.js development server (npm run dev) after
                   any changes to 'next.config.ts' or moving files in 'public'.
            ====================================================================
          */}
          <Image
            src="https://vets.energy/wp-content/themes/vetsenergy/images/logo-vets-ee.svg"
            alt="Vets Energy and Environment Logo"
            width={180} // Should be the actual width of your logo image
            height={40} // Should be the actual height of your logo image
            className="h-10 w-auto" // Controls displayed size
            data-ai-hint="company logo"
            priority // Preloads the logo as it's LCP.
          />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
