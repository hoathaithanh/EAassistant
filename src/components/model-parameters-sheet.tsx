"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useModelParameters, useLanguage } from "@/components/providers";
import type { ModelParameters } from "@/ai/schemas/model-parameters-schema";
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ModelParametersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ModelParametersSheet({
  open,
  onOpenChange,
}: ModelParametersSheetProps) {
  const { parameters, setParameters } = useModelParameters();
  const { t } = useLanguage();

  const handleSliderChange = (key: keyof ModelParameters) => (value: number[]) => {
    setParameters((prev) => ({ ...prev, [key]: value[0] }));
  };

  const SliderControl = ({
    id,
    label,
    description,
    value,
    min,
    max,
    step,
    onValueChange,
  }: {
    id: keyof ModelParameters;
    label: string;
    description: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onValueChange: (value: number[]) => void;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="flex items-center gap-2 text-base font-medium">
          {label}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <div className="w-24 rounded-md border border-input px-2 py-1 text-center font-mono text-base">
          {value.toFixed(id === 'temperature' || id === 'topP' ? 2 : 0)}
        </div>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={onValueChange}
      />
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl">{t('llmParameters')}</SheetTitle>
          <SheetDescription>
            {t('llmParametersDescription')}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-8 py-6">
          <SliderControl
            id="temperature"
            label={t('temperature')}
            description={t('temperatureDescription')}
            value={parameters.temperature ?? 0.3}
            min={0}
            max={1}
            step={0.05}
            onValueChange={handleSliderChange('temperature')}
          />
          <SliderControl
            id="topP"
            label={t('topP')}
            description={t('topPDescription')}
            value={parameters.topP ?? 0.3}
            min={0}
            max={1}
            step={0.05}
            onValueChange={handleSliderChange('topP')}
          />
          <SliderControl
            id="topK"
            label={t('topK')}
            description={t('topKDescription')}
            value={parameters.topK ?? 20}
            min={1}
            max={100}
            step={1}
            onValueChange={handleSliderChange('topK')}
          />
          <SliderControl
            id="maxOutputTokens"
            label={t('maxOutputTokens')}
            description={t('maxOutputTokensDescription')}
            value={parameters.maxOutputTokens ?? 2048}
            min={1}
            max={8192}
            step={64}
            onValueChange={handleSliderChange('maxOutputTokens')}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
