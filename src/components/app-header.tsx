
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
            IMPORTANT - LOGO DISPLAY ISSUES:
            ====================================================================
            1. FILE LOCATION:
               For the logo to display, the image file 'Logo VETS-new.png'
               MUST be placed directly in the 'public' directory at the root
               of your project.
               Correct path: [Your Project Root]/public/Logo VETS-new.png

            2. FILENAME MATCH:
               Ensure the filename in your 'public' directory is EXACTLY
               'Logo VETS-new.png'. This includes capitalization and the
               '.png' extension. (e.g., 'logo vets-new.png' or 'Logo VETS-new.PNG'
               will NOT work if the code expects 'Logo VETS-new.png').

            3. IMAGE DIMENSIONS:
               The 'width' and 'height' props below should be the ACTUAL,
               INTRINSIC dimensions of your image file for optimal performance
               and correct aspect ratio handling by Next.js.
               The className 'h-10 w-auto' then controls the displayed size.
               If 180x40 are not the true dimensions, please update them.

            4. TROUBLESHOOTING:
               - Restart your Next.js development server (npm run dev) after
                 placing/renaming the file.
               - Open your browser's developer console (usually F12). Check the
                 'Network' tab for any 404 (Not Found) errors for
                 '/Logo VETS-new.png'.
               - Try accessing the image directly in your browser:
                 http://localhost:YOUR_PORT/Logo VETS-new.png
                 (replace YOUR_PORT with your dev server's port, e.g., 3000 or 9002).
                 If it doesn't show up here, Next.js isn't serving it.
            ====================================================================
          */}
          <Image
            src="/Logo VETS-new.png"
            alt="Vets Energy and Environment Logo"
            width={180} // IMPORTANT: This should be the ACTUAL width of your 'Logo VETS-new.png' file in pixels.
            height={40} // IMPORTANT: This should be the ACTUAL height of your 'Logo VETS-new.png' file in pixels.
            className="h-10 w-auto" // This styles the image to have a display height of 40px; width adjusts to maintain aspect ratio.
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
