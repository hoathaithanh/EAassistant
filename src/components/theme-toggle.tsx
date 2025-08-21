
"use client";

import { useState } from 'react';
import { Settings, SlidersHorizontal, Palette } from "lucide-react";
import { useTheme, useLanguage } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import ModelParametersSheet from './model-parameters-sheet';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { t } = useLanguage();
  const [isParamsSheetOpen, setIsParamsSheetOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-auto min-h-[68px] w-[70px] p-2 space-y-1 rounded-md text-xs font-medium bg-card text-card-foreground hover:bg-muted focus-visible:ring-primary focus-visible:ring-offset-0"
            aria-label={t('toggleThemeLabel')}
          >
            <Settings className="h-5 w-5 text-foreground/80" />
            <span className="text-foreground/90">{t('settingsLabel')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                    <Palette className="mr-2 h-4 w-4" />
                    <span>{t('themeLabel')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme("light")} data-active={theme === 'light'}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")} data-active={theme === 'dark'}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")} data-active={theme === 'system'}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem onSelect={() => setIsParamsSheetOpen(true)}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <span>{t('llmParameters')}</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ModelParametersSheet open={isParamsSheetOpen} onOpenChange={setIsParamsSheetOpen} />
    </>
  );
}
