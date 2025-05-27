
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import Image from "next/image";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 max-w-screen-2xl items-center"> {/* Changed h-14 to h-12 */}
        <div className="mr-4 flex items-center">
          <Image
            src="/Logo VETS-new.png" // Updated to use the logo from the public directory
            alt="Vets Energy and Environment Logo"
            width={180} // Intrinsic width of the image, adjust if your logo's width is different
            height={40} // Intrinsic height of the image, adjust if your logo's height is different
            className="h-10 w-auto" // Displays with a height of 40px, width adjusts to maintain aspect ratio
            data-ai-hint="company logo"
            priority
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
