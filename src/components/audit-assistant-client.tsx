"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Bot, Zap, Settings2, TextSearch, AlignLeft } from 'lucide-react';
import { useLanguage } from '@/components/providers';

import { rewriteAuditReport, type RewriteAuditReportInput } from '@/ai/flows/rewrite-audit-report';
import { expandAuditReport, type ExpandAuditReportInput } from '@/ai/flows/expand-audit-report';
import { summarizeAuditReport, type SummarizeAuditReportInput } from '@/ai/flows/summarize-audit-report';
import { changeAuditReportTone, type ChangeAuditReportToneInput } from '@/ai/flows/change-audit-report-tone';

type Tone = 'professional' | 'humorous' | 'empathetic' | 'formal' | 'friendly';
const tones: Tone[] = ['professional', 'humorous', 'empathetic', 'formal', 'friendly'];

export default function AuditAssistantClient() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState<Tone>('professional');
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Debounce input text for AI calls if needed, or handle on button click.
  // For simplicity, AI calls are triggered by button clicks.

  const handleCopyToClipboard = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: t('copied'),
        description: 'The generated text has been copied to your clipboard.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy text: ', error);
      toast({
        title: 'Error',
        description: 'Failed to copy text to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const makeAICall = async <TInput, TOutput>(
    aiFunction: (input: TInput) => Promise<TOutput>,
    input: TInput,
    successCallback: (output: TOutput) => void
  ) => {
    if (!inputText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter some text to process.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await aiFunction(input);
      successCallback(result);
    } catch (error) {
      console.error('AI call failed:', error);
      toast({
        title: t('errorOccurred'),
        description: (error as Error).message || 'Unknown error',
        variant: 'destructive',
      });
      setOutputText(''); // Clear output on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewrite = () => {
    makeAICall(
      rewriteAuditReport,
      { text: inputText } as RewriteAuditReportInput,
      (output) => setOutputText(output.rewrittenText)
    );
  };

  const handleExpand = () => {
    makeAICall(
      expandAuditReport,
      { text: inputText } as ExpandAuditReportInput,
      (output) => setOutputText(output.expandedText)
    );
  };

  const handleSummarize = () => {
    makeAICall(
      summarizeAuditReport,
      { reportSection: inputText } as SummarizeAuditReportInput,
      (output) => setOutputText(output.summary)
    );
  };

  const handleChangeTone = () => {
    makeAICall(
      changeAuditReportTone,
      { reportText: inputText, tone: selectedTone } as ChangeAuditReportToneInput,
      (output) => setOutputText(output.modifiedReportText)
    );
  };
  
  // Effect to handle placeholder text changes on language switch
  const [inputPlaceholder, setInputPlaceholder] = useState(t('inputPlaceholder'));
  const [outputPlaceholder, setOutputPlaceholder] = useState(t('outputPlaceholder'));

  useEffect(() => {
    setInputPlaceholder(t('inputPlaceholder'));
    setOutputPlaceholder(t('outputPlaceholder'));
  }, [language, t]);


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Bot className="mr-2 h-6 w-6 text-primary" />
            {t('appName')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="inputText" className="text-base font-medium">{t('inputTextLabel')}</Label>
              <Textarea
                id="inputText"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={inputPlaceholder}
                className="min-h-[200px] md:min-h-[300px] text-base rounded-md shadow-sm focus:ring-primary focus:border-primary"
                rows={10}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputText" className="text-base font-medium">{t('outputTextLabel')}</Label>
              <Textarea
                id="outputText"
                value={outputText}
                readOnly
                placeholder={outputPlaceholder}
                className="min-h-[200px] md:min-h-[300px] text-base bg-muted/50 rounded-md shadow-sm"
                rows={10}
              />
              <Button onClick={handleCopyToClipboard} variant="outline" size="sm" className="mt-2 w-full md:w-auto" disabled={!outputText || isLoading}>
                <Copy className="mr-2 h-4 w-4" />
                {t('copyToClipboard')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Settings2 className="mr-2 h-5 w-5 text-primary" />
            AI Tools
            </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button onClick={handleRewrite} disabled={isLoading} className="w-full justify-start text-left py-6">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {t('rewrite')}
          </Button>
          <Button onClick={handleExpand} disabled={isLoading} className="w-full justify-start text-left py-6">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TextSearch className="mr-2 h-4 w-4" />}
            {t('expand')}
          </Button>
          <Button onClick={handleSummarize} disabled={isLoading} className="w-full justify-start text-left py-6">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlignLeft className="mr-2 h-4 w-4" />}
            {t('summarize')}
          </Button>
          <div className="space-y-2 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
              <Select value={selectedTone} onValueChange={(value) => setSelectedTone(value as Tone)} disabled={isLoading}>
                <SelectTrigger className="flex-grow min-w-[150px] py-3">
                  <SelectValue placeholder={t('toneLabel')} />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {t(tone)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleChangeTone} disabled={isLoading} className="w-full sm:w-auto py-3 flex-shrink-0">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('changeTone')}
              </Button>
            </div>
          </div>
        </CardContent>
         {isLoading && (
          <CardFooter>
            <p className="text-sm text-muted-foreground flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('processing')}
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
