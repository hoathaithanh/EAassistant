
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
    max,
    step,
    onValueChange,
  }: {
    id: keyof ModelParameters;
    label: string;
    description: string;
    value: number;
    max: number;
    step: number;
    onValueChange: (value: number[]) => void;
  }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="text-lg">
          {label}
        </Label>
        <span className="text-lg font-semibold w-20 text-right">{value}</span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Slider
        id={id}
        min={0}
        max={max}
        step={step}
        value={[value]}
        onValueChange={onValueChange}
        className="[&>span]:h-1 [&>span]:w-1"
      />
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl">{t('llmParameters')}</SheetTitle>
          <SheetDescription>
            {/* You can add a description here if needed */}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-8 py-6">
          <SliderControl
            id="temperature"
            label={t('temperature')}
            description={t('temperatureDescription')}
            value={parameters.temperature ?? 0.3}
            max={1}
            step={0.05}
            onValueChange={handleSliderChange('temperature')}
          />
          <SliderControl
            id="topP"
            label={t('topP')}
            description={t('topPDescription')}
            value={parameters.topP ?? 0.3}
            max={1}
            step={0.05}
            onValueChange={handleSliderChange('topP')}
          />
          <SliderControl
            id="topK"
            label={t('topK')}
            description={t('topKDescription')}
            value={parameters.topK ?? 20}
            max={100}
            step={1}
            onValueChange={handleSliderChange('topK')}
          />
          <SliderControl
            id="maxOutputTokens"
            label={t('maxOutputTokens')}
            description={t('maxOutputTokensDescription')}
            value={parameters.maxOutputTokens ?? 2048}
            max={8192}
            step={64}
            onValueChange={handleSliderChange('maxOutputTokens')}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
