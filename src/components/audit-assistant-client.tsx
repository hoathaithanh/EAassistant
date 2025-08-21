
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
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
import { useLanguage, ModelParameters, useModelParameters } from "@/components/providers";
import { Textarea } from '@/components/ui/textarea';

import { rewriteAuditReport, type RewriteAuditReportInput } from '@/ai/flows/rewrite-audit-report';
import { expandAuditReport, type ExpandAuditReportInput, type ExpandAuditReportOutput } from '@/ai/flows/expand-audit-report';
import { summarizeAuditReport, type SummarizeAuditReportInput } from '@/ai/flows/summarize-audit-report';
import { changeAuditReportTone, type ChangeAuditReportToneInput } from '@/ai/flows/change-audit-report-tone';
import { deepResearch, type DeepResearchInput, type DeepResearchOutput } from '@/ai/flows/deep-research-flow';
import type { GenerationCommonConfig } from 'genkit';


type Tone = 'professional' | 'formal' | 'empathetic' | 'friendly' | 'humorous';
const tones: Tone[] = ['professional', 'formal', 'empathetic', 'friendly', 'humorous'];

interface ResearchResult {
  title: string;
  snippet: string;
  displayLink: string;
}

// This function provides a base configuration. In a real app, you might fetch
// these values from a user's settings, a database, or environment variables.
function getConfig(
  customConfig: Partial<GenerationCommonConfig> = {}
): GenerationCommonConfig {
  const defaults: GenerationCommonConfig = {
    temperature: 0.3,
    topP: 0.3,
    topK: 20,
    maxOutputTokens: 2048,
    // frequencyPenalty and presencePenalty are not standard in Gemini,
    // but are kept here as placeholders if you switch to a model that supports them.
  };

  // Filter out undefined values from customConfig before merging
  const filteredCustomConfig = Object.fromEntries(
    Object.entries(customConfig).filter(([, value]) => value !== undefined)
  );
  
  return {...defaults, ...filteredCustomConfig};
}

export default function AuditAssistantClient() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [processedOutputHtml, setProcessedOutputHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepResearchLoading, setIsDeepResearchLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState<Tone>('professional');
  const [deepResearchResults, setDeepResearchResults] = useState<DeepResearchOutput['results']>([]);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { parameters } = useModelParameters();

  const [inputPlaceholder, setInputPlaceholder] = useState(t('inputPlaceholder'));
  const [outputPlaceholder, setOutputPlaceholder] = useState(t('outputPlaceholder'));

  useEffect(() => {
    setInputPlaceholder(t('inputPlaceholder'));
    setOutputPlaceholder(t('outputPlaceholder'));
  }, [language, t]);

  useEffect(() => {
    if (outputText) {
      // Process for bold/italic and then handle newlines
      const withStyling = outputText.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
      setProcessedOutputHtml(withStyling);
    } else {
      setProcessedOutputHtml('');
    }
  }, [outputText]);


  const handleCopyToClipboard = (textToCopy: string, type: 'output' | 'research') => {
    if (!textToCopy) return;
  
    // Modern API with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        toast({
          title: t('copied'),
          description: type === 'output' ? 'The generated text has been copied.' : 'The research results have been copied.',
          duration: 3000,
        });
      }).catch(err => {
        console.error('Modern copy failed: ', err);
        // If modern API fails, it might be due to transient browser issues, try legacy
        legacyCopy(textToCopy, type);
      });
    } else {
      // Fallback for non-secure contexts or older browsers
      legacyCopy(textToCopy, type);
    }
  };
  
  const legacyCopy = (textToCopy: string, type: 'output' | 'research') => {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
  
    // Make the textarea out of sight
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast({
          title: t('copied'),
          description: t('legacyCopySuccess'),
          duration: 3000,
        });
      } else {
        throw new Error('Copy command failed');
      }
    } catch (err) {
      console.error('Legacy copy failed: ', err);
      toast({
        title: t('errorOccurred'),
        description: 'Failed to copy text to clipboard.',
        variant: 'destructive',
      });
    }
  
    document.body.removeChild(textArea);
  };

  const makeAICall = async <TInput extends { config?: ModelParameters }, TOutput>(
    aiFunction: (input: TInput) => Promise<TOutput>,
    input: Omit<TInput, 'config'>,
    successCallback: (output: TOutput) => void,
    setLoadingState: (loading: boolean) => void = setIsLoading
  ) => {
    const fullInput = { ...input, config: getConfig(parameters) } as TInput;

    if (!inputText.trim() && aiFunction !== deepResearch) {
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
      const result = await aiFunction(fullInput);
      successCallback(result);
    } catch (error) {
      console.error('AI call failed:', error);
      const errorMessage = (error as Error).message || 'Unknown error';
      let toastDescription = errorMessage;
  
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        toastDescription = t('aiServiceOverloadedError');
      }
  
      toast({
        title: t('errorOccurred'),
        description: toastDescription,
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
      { text: inputText, outputLanguage: language },
      (output) => setOutputText(output.rewrittenText)
    );
  };

  const handleExpand = () => {
    makeAICall(
        expandAuditReport,
        { text: inputText, outputLanguage: language },
        (output: ExpandAuditReportOutput) => setOutputText(output.expandedText)
    );
  };

  const handleSummarize = () => {
    makeAICall(
      summarizeAuditReport,
      { reportSection: inputText, outputLanguage: language },
      (output) => setOutputText(output.summary)
    );
  };

  const handleChangeTone = () => {
    makeAICall(
      changeAuditReportTone,
      { reportText: inputText, tone: selectedTone, outputLanguage: language },
      (output) => setOutputText(output.modifiedReportText)
    );
  };

  const handleDeepResearch = () => {
    makeAICall(
      deepResearch,
      { inputText: outputText, outputLanguage: language },
      (output: DeepResearchOutput) => setDeepResearchResults(output.results || []),
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
            id="outputText"
            className="min-h-[200px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-base shadow-sm whitespace-pre-wrap overflow-auto"
            style={{lineHeight: '1.5rem'}}
          >
            {processedOutputHtml ? (
              <div dangerouslySetInnerHTML={{ __html: processedOutputHtml }} />
            ) : (
              <p className="text-muted-foreground">{outputPlaceholder}</p>
            )}
          </div>
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

    
