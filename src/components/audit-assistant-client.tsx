
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Zap, Settings2, TextSearch, AlignLeft, FileText, Sparkles, Library, Link as LinkIcon, Search } from 'lucide-react';
import { useLanguage } from '@/components/providers';

import { rewriteAuditReport, type RewriteAuditReportInput } from '@/ai/flows/rewrite-audit-report';
import { expandAuditReport, type ExpandAuditReportInput } from '@/ai/flows/expand-audit-report';
import { summarizeAuditReport, type SummarizeAuditReportInput } from '@/ai/flows/summarize-audit-report';
import { changeAuditReportTone, type ChangeAuditReportToneInput } from '@/ai/flows/change-audit-report-tone';
import { deepResearch, type DeepResearchInput, type DeepResearchOutput } from '@/ai/flows/deep-research-flow';

type Tone = 'professional' | 'formal' | 'empathetic' | 'friendly' | 'humorous';
const tones: Tone[] = ['professional', 'formal', 'empathetic', 'friendly', 'humorous'];

interface ResearchResult {
  title: string;
  snippet: string;
  link: string;
}

export default function AuditAssistantClient() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepResearchLoading, setIsDeepResearchLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState<Tone>('professional');
  const [deepResearchResults, setDeepResearchResults] = useState<ResearchResult[]>([]);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleCopyToClipboard = async (textToCopy: string, type: 'output' | 'research') => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: t('copied'),
        description: type === 'output'
          ? 'The generated text has been copied to your clipboard.'
          : 'The research results have been copied to your clipboard.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy text: ', error);
      toast({
        title: t('errorOccurred'),
        description: 'Failed to copy text to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const makeAICall = async <TInput, TOutput>(
    aiFunction: (input: TInput) => Promise<TOutput>,
    input: TInput,
    successCallback: (output: TOutput) => void,
    setLoadingState: (loading: boolean) => void = setIsLoading // Default to main loading
  ) => {
    if (!inputText.trim() && aiFunction !== deepResearch) { // inputText check not needed for deep research (uses outputText)
      toast({
        title: 'Input Required',
        description: 'Please enter some text to process.',
        variant: 'destructive',
      });
      return;
    }
    if (aiFunction === deepResearch && !outputText.trim()) {
      toast({
        title: 'Generated Text Required',
        description: 'Please generate some text first before searching for related documents.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingState(true);
    try {
      const result = await aiFunction(input);
      successCallback(result);
    } catch (error) {
      console.error('AI call failed:', error);
      let description = (error as Error).message || t('unknownError');
      const errorMessage = (error as Error).message?.toLowerCase() || "";

      if (errorMessage.includes('503 service unavailable') || errorMessage.includes('model is overloaded') || errorMessage.includes('overloaded')) {
        description = t('aiServiceOverloadedError');
      }
      
      toast({
        title: t('errorOccurred'),
        description: description,
        variant: 'destructive',
      });
      if (aiFunction !== deepResearch) setOutputText('');
      else setDeepResearchResults([]);
    } finally {
      setLoadingState(false);
    }
  };

  const handleRewrite = () => {
    makeAICall(
      rewriteAuditReport,
      { text: inputText, outputLanguage: language } as RewriteAuditReportInput,
      (output) => setOutputText(output.rewrittenText)
    );
  };

  const handleExpand = () => {
    makeAICall(
      expandAuditReport,
      { text: inputText, outputLanguage: language } as ExpandAuditReportInput,
      (output) => setOutputText(output.expandedText)
    );
  };

  const handleSummarize = () => {
    makeAICall(
      summarizeAuditReport,
      { reportSection: inputText, outputLanguage: language } as SummarizeAuditReportInput,
      (output) => setOutputText(output.summary)
    );
  };

  const handleChangeTone = () => {
    makeAICall(
      changeAuditReportTone,
      { reportText: inputText, tone: selectedTone, outputLanguage: language } as ChangeAuditReportToneInput,
      (output) => setOutputText(output.modifiedReportText)
    );
  };

  const handleDeepResearch = () => {
    makeAICall(
      deepResearch,
      { inputText: outputText, outputLanguage: language } as DeepResearchInput,
      (output: DeepResearchOutput) => setDeepResearchResults(output.results || []),
      setIsDeepResearchLoading
    );
  };

  const [inputPlaceholder, setInputPlaceholder] = useState(t('inputPlaceholder'));
  const [outputPlaceholder, setOutputPlaceholder] = useState(t('outputPlaceholder'));

  useEffect(() => {
    setInputPlaceholder(t('inputPlaceholder'));
    setOutputPlaceholder(t('outputPlaceholder'));
  }, [language, t]);

  const formatDeepResearchResultsForCopy = (results: ResearchResult[]): string => {
    return results.map(result =>
      `Title: ${result.title}\nSnippet: ${result.snippet}\nLink: ${result.link}`
    ).join('\n\n');
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            {t('inputTextLabel')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={inputPlaceholder}
            className="min-h-[200px] text-base rounded-md shadow-sm focus:ring-primary focus:border-primary"
            rows={10}
            disabled={isLoading || isDeepResearchLoading}
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Settings2 className="mr-2 h-5 w-5 text-primary" />
            {t('aiToolsLabel')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button onClick={handleRewrite} disabled={isLoading || isDeepResearchLoading} className="w-full justify-start text-left py-6">
            {isLoading && !isDeepResearchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {t('rewrite')}
          </Button>
          <Button onClick={handleExpand} disabled={isLoading || isDeepResearchLoading} className="w-full justify-start text-left py-6">
            {isLoading && !isDeepResearchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TextSearch className="mr-2 h-4 w-4" />}
            {t('expand')}
          </Button>
          <Button onClick={handleSummarize} disabled={isLoading || isDeepResearchLoading} className="w-full justify-start text-left py-6">
            {isLoading && !isDeepResearchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlignLeft className="mr-2 h-4 w-4" />}
            {t('summarize')}
          </Button>
          <div className="space-y-2 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
              <Select value={selectedTone} onValueChange={(value) => setSelectedTone(value as Tone)} disabled={isLoading || isDeepResearchLoading}>
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
              <Button onClick={handleChangeTone} disabled={isLoading || isDeepResearchLoading} className="w-full sm:w-auto py-3 flex-shrink-0">
                {(isLoading && !isDeepResearchLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('changeTone')}
              </Button>
            </div>
          </div>
        </CardContent>
         {(isLoading && !isDeepResearchLoading) && ( // Only show main processing spinner if not deep research loading
          <CardFooter>
            <p className="text-sm text-muted-foreground flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('processing')}
            </p>
          </CardFooter>
        )}
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            {t('outputTextLabel')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="outputText"
            value={outputText}
            readOnly
            placeholder={outputPlaceholder}
            className="min-h-[200px] text-base bg-muted/50 rounded-md shadow-sm"
            rows={10}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-end space-y-2 px-6 pb-6 pt-4">
          <p className="text-xs text-muted-foreground text-right w-full">
            {t('aiGeneratedContentWarning')}
          </p>
           <Button
            onClick={() => handleCopyToClipboard(outputText, 'output')}
            variant="outline"
            size="sm"
            className="w-full md:w-auto"
            disabled={!outputText || isLoading || isDeepResearchLoading}
           >
            <Copy className="mr-2 h-4 w-4" />
            {t('copyToClipboard')}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center text-lg">
              <Library className="mr-2 h-5 w-5 text-primary" />
              {t('relatedDocumentsTitle')}
            </CardTitle>
            <Button
              onClick={handleDeepResearch}
              disabled={!outputText || isLoading || isDeepResearchLoading}
              size="sm"
            >
              {isDeepResearchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {t('searchRelatedDocuments')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDeepResearchLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
              <p className="text-muted-foreground">{t('processing')}</p>
            </div>
          )}
          {!isDeepResearchLoading && deepResearchResults.length === 0 && (
            <p className="text-muted-foreground text-center py-4">{t('noDocumentsFound')}</p>
          )}
          {!isDeepResearchLoading && deepResearchResults.length > 0 && (
            <ul className="space-y-6">
              {deepResearchResults.map((result, index) => (
                <li key={index} className="p-4 border rounded-md shadow-sm bg-background">
                  <h3 className="font-semibold text-md mb-1 text-primary">{result.title}</h3>
                  <p className="text-sm text-foreground/90 mb-2">{result.snippet}</p>
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-accent hover:text-accent/80 hover:underline"
                  >
                    <LinkIcon className="mr-1 h-4 w-4" />
                    {t('viewSource')}
                  </a>
                  {index < deepResearchResults.length - 1 && <Separator className="mt-4" />}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        {deepResearchResults.length > 0 && !isDeepResearchLoading && (
          <CardFooter className="flex justify-end">
            <Button
              onClick={() => handleCopyToClipboard(formatDeepResearchResultsForCopy(deepResearchResults), 'research')}
              variant="outline"
              size="sm"
              className="w-full md:w-auto"
              disabled={isDeepResearchLoading}
            >
              <Copy className="mr-2 h-4 w-4" />
              {t('copyResults')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
