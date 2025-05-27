
"use client";

import { useLanguage } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Simplified SVG for UK Flag
const UKFlagIcon = () => (
  <svg width="24" height="18" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <clipPath id="t">
      <path d="M0,0 v30 h60 v-30 z"/>
    </clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#00247d"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#t)"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#cf142b" strokeWidth="4" clipPath="url(#t)"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" clipPath="url(#t)"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6" clipPath="url(#t)"/>
  </svg>
);

// Simplified SVG for Vietnam Flag
const VietnamFlagIcon = () => (
  <svg width="24" height="18" viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H30V20H0V0Z" fill="#DA251D"/>
    <path d="M15 4L16.5948 8.23607H21.1803L17.8927 10.9695L19.1803 15.2056L15 12.7639L10.8197 15.2056L12.1073 10.9695L8.81966 8.23607H13.4052L15 4Z" fill="#FFFF00"/>
  </svg>
);

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('toggleLanguage', language === 'en' ? 'vn' : 'en') || "Toggle language"}>
          {language === "en" ? <UKFlagIcon /> : <VietnamFlagIcon />}
          <span className="sr-only">Toggle language ({language === 'en' ? 'Current: English' : 'Current: Vietnamese'})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("en")} data-active={language === 'en'}>
          <UKFlagIcon /> <span className="ml-2">{t('english', 'en')} (EN)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("vn")} data-active={language === 'vn'}>
          <VietnamFlagIcon /> <span className="ml-2">{t('vietnamese', 'vn')} (VN)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
