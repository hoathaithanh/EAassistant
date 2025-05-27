
"use client";

import { useLanguage } from "@/components/providers";
import { Button } from "@/components/ui/button";

// Adjusted SVG for UK Flag with slightly larger default size
const UKFlagIcon = () => (
  <svg width="32" height="21" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" className="mb-0.5">
    <clipPath id="t-uk">
      <path d="M0,0 v30 h60 v-30 z"/>
    </clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#00247d"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#t-uk)"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#cf142b" strokeWidth="4" clipPath="url(#t-uk)"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" clipPath="url(#t-uk)"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6" clipPath="url(#t-uk)"/>
  </svg>
);

// Adjusted SVG for Vietnam Flag with slightly larger default size
const VietnamFlagIcon = () => (
  <svg width="32" height="21" viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" className="mb-0.5">
    <path d="M0 0H30V20H0V0Z" fill="#DA251D"/>
    <path d="M15 4L16.5948 8.23607H21.1803L17.8927 10.9695L19.1803 15.2056L15 12.7639L10.8197 15.2056L12.1073 10.9695L8.81966 8.23607H13.4052L15 4Z" fill="#FFFF00"/>
  </svg>
);

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const buttonBaseStyle = "flex flex-col items-center justify-center h-auto min-h-[68px] w-[70px] p-2 space-y-1 rounded-md text-xs font-medium focus-visible:ring-primary focus-visible:ring-offset-0";

  return (
    <div className="flex space-x-2">
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        className={`${buttonBaseStyle} ${language === 'en' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-card text-card-foreground hover:bg-muted border-border'}`}
        onClick={() => setLanguage("en")}
        aria-label={t('setLanguageTo', { lang: t('english') })}
      >
        <UKFlagIcon />
        <span className={language === 'en' ? 'text-primary-foreground/90' : 'text-foreground/90'}>{t('english')}</span>
      </Button>
      <Button
        variant={language === 'vn' ? 'default' : 'outline'}
        className={`${buttonBaseStyle} ${language === 'vn' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-card text-card-foreground hover:bg-muted border-border'}`}
        onClick={() => setLanguage("vn")}
        aria-label={t('setLanguageTo', { lang: t('vietnamese') })}
      >
        <VietnamFlagIcon />
        <span className={language === 'vn' ? 'text-primary-foreground/90' : 'text-foreground/90'}>{t('vietnamese')}</span>
      </Button>
    </div>
  );
}
