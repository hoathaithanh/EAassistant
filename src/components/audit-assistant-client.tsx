
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
import { useLanguage, useModelParameters, ModelParameters } from '@/components/providers';

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
  displayLink: string;
}

const CHARS_PER_PAGE = 2500; // Approximate characters for an A4 page

export default function AuditAssistantClient() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepResearchLoading, setIsDeepResearchLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState<Tone>('professional');
  const [deepResearchResults, setDeepResearchResults] = useState<DeepResearchOutput['results']>([]);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { parameters: modelParameters } = useModelParameters();
  
  const [paginatedOutput, setPaginatedOutput] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [inputPlaceholder, setInputPlaceholder] = useState(t('inputPlaceholder'));
  const [outputPlaceholder, setOutputPlaceholder] = useState(t('outputPlaceholder'));

  useEffect(() => {
    setInputPlaceholder(t('inputPlaceholder'));
    setOutputPlaceholder(t('outputPlaceholder'));
  }, [language, t]);

  useEffect(() => {
    if (typeof outputText === 'string' && outputText) {
      const pages = [];
      let remainingText = outputText;
      while (remainingText.length > 0) {
        if (remainingText.length <= CHARS_PER_PAGE) {
          pages.push(remainingText);
          break;
        }

        let sliceEnd = CHARS_PER_PAGE;
        // Try to not cut words/sentences in half
        const lastPeriod = remainingText.lastIndexOf('.', sliceEnd);
        const lastSpace = remainingText.lastIndexOf(' ', sliceEnd);

        if (lastPeriod > CHARS_PER_PAGE - 200) { // prefer sentence end
          sliceEnd = lastPeriod + 1;
        } else if (lastSpace > CHARS_PER_PAGE - 200) { // or word end
          sliceEnd = lastSpace + 1;
        }
        
        pages.push(remainingText.substring(0, sliceEnd));
        remainingText = remainingText.substring(sliceEnd);
      }
      setPaginatedOutput(pages.map(page => page.replace(/\*\*\*(.*?)\*\*\*/gs, '<strong><em>$1</em></strong>')));
      setCurrentPage(1);
    } else {
      setPaginatedOutput([]);
      setCurrentPage(1);
    }
  }, [outputText]);

  const handleCopyToClipboard = async (textToCopy: string) => {
    if (!textToCopy) return;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        toast({
          title: t('copied'),
          description: t('clipboardApiSuccess'),
        });
      } catch (err) {
        console.error('Failed to copy with Clipboard API: ', err);
        toast({ title: t('errorOccurred'), description: (err as Error).message, variant: 'destructive' });
      }
    } else {
      // Fallback for non-secure contexts or older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: t('copied'),
          description: t('legacyCopySuccess'),
        });
      } catch (err) {
        console.error('Failed to copy with execCommand: ', err);
        toast({ title: t('errorOccurred'), description: (err as Error).message, variant: 'destructive' });
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const makeAICall = async <TInput, TOutput>(
    aiFunction: (input: TInput) => Promise<TOutput>,
    input: TInput,
    getOutput: (output: TOutput) => string,
    setLoadingState: (loading: boolean) => void = setIsLoading
  ) => {
    const textForProcessing = aiFunction === deepResearch ? outputText : inputText;
    if (!textForProcessing.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter some text to process.',
        variant: 'destructive',
      });
      return;
    }

    setLoadingState(true);
    try {
      // Add model parameters to the input object
      const fullInput = { ...input, config: modelParameters };
      const result = await aiFunction(fullInput);

      if (aiFunction === deepResearch) {
        setDeepResearchResults((result as DeepResearchOutput).results || []);
      } else {
        const resultText = getOutput(result);
        setOutputText(resultText || ''); // Ensure we always set a string
      }

    } catch (error) {
      console.error('AI call failed:', error);
      toast({
        title: t('errorOccurred'),
        description: (error as Error).message || 'Unknown error',
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
      (output) => output.rewrittenText
    );
  };

  const handleExpand = () => {
    makeAICall(
      expandAuditReport,
      { text: inputText, outputLanguage: language } as ExpandAuditReportInput,
      (output) => output.expandedText
    );
  };

  const handleSummarize = () => {
    makeAICall(
      summarizeAuditReport,
      { reportSection: inputText, outputLanguage: language } as SummarizeAuditReportInput,
      (output) => output.summary
    );
  };

  const handleChangeTone = () => {
    makeAICall(
      changeAuditReportTone,
      { reportText: inputText, tone: selectedTone, outputLanguage: language } as ChangeAuditReportToneInput,
      (output) => output.modifiedReportText
    );
  };

  const handleDeepResearch = () => {
    makeAICall(
      deepResearch,
      { inputText: outputText, outputLanguage: language } as DeepResearchInput,
      () => '', // Not used for deep research, result is handled directly
      setIsDeepResearchLoading
    );
  };

  const formatDeepResearchResultsForCopy = (results: ResearchResult[]): string => {
    return results.map(result =>
      `Title: ${result.title}\nSnippet: ${result.snippet}\nLink: ${result.displayLink}`
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
        <div
            className="prose dark:prose-invert max-w-none min-h-[400px] w-full rounded-md border border-input bg-muted/50 p-6 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: paginatedOutput[currentPage - 1] || `<p class="text-muted-foreground">${outputPlaceholder}</p>` }}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4 px-6 pb-6 pt-4">
           {paginatedOutput.length > 1 && (
            <div className="flex items-center justify-center space-x-2">
              {paginatedOutput.map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {t('page')} {index + 1}
                </Button>
              ))}
            </div>
          )}
          <div className="flex flex-col items-end space-y-2 w-full">
            <p className="text-xs text-muted-foreground text-right w-full">
              {t('aiGeneratedContentWarning')}
            </p>
            <Button
              onClick={() => handleCopyToClipboard(outputText)}
              variant="outline"
              size="sm"
              className="w-full md:w-auto"
              disabled={!outputText || isLoading || isDeepResearchLoading}
            >
              <Copy className="mr-2 h-4 w-4" />
              {t('copyToClipboard')}
            </Button>
          </div>
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
                    href={result.displayLink}
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
              onClick={() => handleCopyToClipboard(formatDeepResearchResultsForCopy(deepResearchResults))}
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

    