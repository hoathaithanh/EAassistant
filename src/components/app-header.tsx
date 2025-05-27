
"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import Image from "next/image";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          {/* Placeholder for the logo. For actual logo, place image in /public and update src. */}
          <Image
            src="https://placehold.co/180x40.png?text=Vets+%7C+Energy+%26+Environment&font=roboto"
            alt="Vets Energy and Environment Logo"
            width={180}
            height={40}
            className="h-10 w-auto"
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
