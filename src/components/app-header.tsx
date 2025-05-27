
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import Image from "next/image";
import { useLanguage } from "@/components/providers";

export default function AppHeader() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center"> {/* Changed h-12 to h-20 */}
        <div className="mr-4 flex flex-col items-start">
          {/*
            ====================================================================
            IMPORTANT - LOGO DISPLAY NOTES:
            ====================================================================
            1. IMAGE SOURCE:
               The image source is an SVG URL from 'vets.energy'.

            2. NEXT.CONFIG.JS:
               The hostname 'vets.energy' MUST be in next.config.ts
               remotePatterns for Next.js to optimize this image.
               This was added in a previous step. If issues persist,
               ensure your dev server was restarted after that change.

            3. IMAGE DIMENSIONS:
               - `width={180}` and `height={40}` are the INTRINSIC dimensions
                 of the source SVG. These are crucial for Next.js optimization
                 and aspect ratio calculation.
               - `className="h-10 w-auto"` controls the DISPLAYED size (40px height).

            4. TROUBLESHOOTING LOGO NOT DISPLAYING:
               - VERIFY THE FULL URL: Is "https://vets.energy/wp-content/themes/vetsenergy/images/logo-vets-ee.svg" accessible in your browser?
               - CHECK NEXT.CONFIG.TS: Confirm 'vets.energy' is in `images.remotePatterns`.
               - RESTART DEV SERVER: If you modified next.config.ts, restart `npm run dev`.
               - BROWSER CONSOLE: Look for network errors related to the image.
               - CASE SENSITIVITY: If using a local file in /public, ensure filename matches exactly.
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
          <h1 className="mt-0.5 text-lg font-semibold text-primary"> {/* Changed text-xs to text-lg */}
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
