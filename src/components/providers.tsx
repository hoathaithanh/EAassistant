
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ModelParameters } from "@/ai/schemas/model-parameters-schema";


// Theme Provider
type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialThemeState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialThemeState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme);
      }
      setTheme(newTheme);
    },
  }), [theme, storageKey]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Language Provider
export type Language = 'en' | 'vn';

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
}

interface LanguageProviderState {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, langOrParams?: Language | Record<string, string>) => string;
}

const translations: Record<string, Record<Language, string>> = {
  appName: { en: 'Energy Audit Writing Assistant', vn: 'Công cụ hỗ trợ viết báo cáo' },
  inputTextLabel: { en: 'Your Audit Text', vn: 'Nội dung Kiểm toán của Bạn' },
  outputTextLabel: { en: 'Generated Text', vn: 'Nội dung Tạo ra' },
  copyToClipboard: { en: 'Copy to Clipboard', vn: 'Sao chép vào Clipboard' },
  copied: { en: 'Copied to clipboard!', vn: 'Đã sao chép!' },
  rewrite: { en: 'Rewrite', vn: 'Viết lại' },
  expand: { en: 'Expand', vn: 'Mở rộng' },
  summarize: { en: 'Summarize', vn: 'Tóm tắt' },
  changeTone: { en: 'Change Tone', vn: 'Đổi Giọng văn' },
  toneLabel: { en: 'Select Tone', vn: 'Chọn Giọng văn' },
  professional: { en: 'Professional', vn: 'Chuyên nghiệp' },
  humorous: { en: 'Humorous', vn: 'Hài hước' },
  empathetic: { en: 'Empathetic', vn: 'Đồng cảm' },
  formal: { en: 'Formal', vn: 'Trang trọng' },
  friendly: { en: 'Friendly', vn: 'Thân thiện' },
  processing: { en: 'Processing...', vn: 'Đang xử lý...' },
  errorOccurred: { en: 'An error occurred', vn: 'Đã xảy ra lỗi' },
  english: { en: 'English', vn: 'Tiếng Anh' },
  vietnamese: { en: 'Vietnamese', vn: 'Tiếng Việt' },
  inputPlaceholder: { en: 'Enter your audit report content here...', vn: 'Nhập nội dung báo cáo kiểm toán của bạn tại đây...' },
  outputPlaceholder: { en: 'AI generated content will appear here...', vn: 'Nội dung do AI tạo sẽ xuất hiện ở đây...' },
  aiToolsLabel: { en: 'AI Tools', vn: 'Công cụ AI'},
  searchRelatedDocuments: { en: 'Search for Related Documents', vn: 'Tìm kiếm tài liệu liên quan'},
  relatedDocumentsTitle: { en: 'Related Documents', vn: 'Tài liệu Liên quan'},
  noDocumentsFound: { en: 'No documents found.', vn: 'Không tìm thấy tài liệu nào.'},
  copyResults: { en: 'Copy Results', vn: 'Sao chép Kết quả'},
  viewSource: { en: 'View Source', vn: 'Xem Nguồn'},
  toggleLanguage: { en: 'Toggle Language', vn: 'Thay đổi ngôn ngữ'},
  settingsLabel: { en: 'Setting', vn: 'Cài đặt'},
  setLanguageTo: { en: "Set language to {{lang}}", vn: "Đặt ngôn ngữ thành {{lang}}" },
  toggleThemeLabel: { en: "Toggle theme", vn: "Chuyển đổi giao diện" },
  aiGeneratedContentWarning: {
    en: 'AI-generated content may not be entirely accurate or suitable. Please review carefully before use.',
    vn: 'Nội dung do AI tạo sinh viết có thể chưa sát thực tế, hãy kiểm tra kỹ trước khi sử dụng.'
  },
  legacyCopySuccess: {
    en: 'Text copied using fallback method.',
    vn: 'Đã sao chép văn bản bằng phương pháp dự phòng.',
  },
  clipboardApiSuccess: {
    en: 'Text copied to clipboard.',
    vn: 'Đã sao chép vào bộ nhớ tạm.',
  },
  llmParameters: { en: 'LLM Parameters', vn: 'Tham số LLM' },
  llmParametersDescription: { 
    en: 'Fine-tune the model’s behavior for your specific needs.', 
    vn: 'Tinh chỉnh hành vi của mô hình cho nhu cầu cụ thể của bạn.' 
  },
  themeLabel: { en: 'Theme', vn: 'Giao diện' },
  temperature: { en: 'Temperature', vn: 'Nhiệt độ' },
  temperatureDescription: {
    en: 'Controls randomness. Lowering the temperature means the model produces more repetitive and deterministic responses. Increasing it leads to more unexpected or creative responses. (Range: 0.0 to 1.0)',
    vn: 'Kiểm soát tính ngẫu nhiên. Giảm nhiệt độ có nghĩa là mô hình tạo ra các câu trả lời lặp đi lặp lại và xác định hơn. Tăng nhiệt độ dẫn đến các câu trả lời bất ngờ hoặc sáng tạo hơn. (Phạm vi: 0.0 đến 1.0)',
  },
  topP: { en: 'Top P', vn: 'Top P' },
  topPDescription: {
    en: 'Controls diversity via nucleus sampling. Top-p considers the results of the tokens with the highest probability mass. A lower value filters out less likely tokens, making the output more focused and deterministic. (Range: 0.0 to 1.0)',
    vn: 'Kiểm soát sự đa dạng thông qua lấy mẫu hạt nhân. Top-p xem xét kết quả của các token có khối lượng xác suất cao nhất. Giá trị thấp hơn sẽ lọc ra các token ít có khả năng hơn, làm cho đầu ra tập trung và xác định hơn. (Phạm vi: 0.0 đến 1.0)',
  },
  topK: { en: 'Top K', vn: 'Top K' },
  topKDescription: {
    en: 'Controls diversity by filtering to the K most likely next tokens. A lower value makes the output more focused and deterministic. For example, a value of 1 means the next token is always the most likely. (Range: 1 to 100)',
    vn: 'Kiểm soát sự đa dạng bằng cách lọc K token tiếp theo có khả năng xảy ra cao nhất. Giá trị thấp hơn làm cho đầu ra tập trung và xác định hơn. Ví dụ, giá trị 1 có nghĩa là token tiếp theo luôn là token có khả năng xảy ra cao nhất. (Phạm vi: 1 đến 100)',
  },
  maxOutputTokens: { en: 'Max Tokens', vn: 'Tokens tối đa' },
  maxOutputTokensDescription: {
    en: 'Sets the maximum number of tokens to generate in the response. A token is approximately four characters. The actual output may be shorter. (Range: 1 to 8192)',
    vn: 'Đặt số lượng token tối đa để tạo trong phản hồi. Một token tương đương khoảng bốn ký tự. Đầu ra thực tế có thể ngắn hơn. (Phạm vi: 1 đến 8192)',
  },
  aiServiceOverloadedError: {
    en: 'The AI service is currently overloaded or unavailable. Please try again in a few moments.',
    vn: 'Dịch vụ AI hiện đang quá tải hoặc không khả dụng. Vui lòng thử lại sau ít phút.',
  },
  page: { en: 'Page', vn: 'Trang' },
};

const LanguageProviderContext = createContext<LanguageProviderState | undefined>(undefined);

export function LanguageProvider({
  children,
  defaultLanguage = 'vn',
  storageKey = 'app-language',
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedLanguage = localStorage.getItem(storageKey) as Language;
      if (storedLanguage && translations['appName'][storedLanguage]) {
        setLanguageState(storedLanguage);
      } else {
        localStorage.setItem(storageKey, defaultLanguage);
        if (language !== defaultLanguage) {
            setLanguageState(defaultLanguage);
        }
      }
    } catch (e) {
        console.error("Failed to access localStorage for language setting:", e);
        if (language !== defaultLanguage) {
            setLanguageState(defaultLanguage);
        }
    }
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, defaultLanguage]);

  const setLanguage = (lang: Language) => {
    if (hydrated) {
        try {
            localStorage.setItem(storageKey, lang);
        } catch (e) {
            console.error("Failed to set language in localStorage:", e);
        }
    }
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vn' : 'en');
  };

  const t = (key: string, langOrParams?: Language | Record<string, string>) => {
    const effectiveLanguage = hydrated ? language : defaultLanguage;
    let translation = translations[key]?.[effectiveLanguage] || key;

    if (typeof langOrParams === 'object' && langOrParams !== null) {
      Object.entries(langOrParams).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
      });
    } else if (typeof langOrParams === 'string' && translations[key]?.[langOrParams]) {
      // Fallback for simple language override if params not used
      translation = translations[key]?.[langOrParams] || key;
    }
    return translation;
  };


  const value = useMemo(() => ({
    language: hydrated ? language : defaultLanguage,
    setLanguage,
    toggleLanguage,
    t,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [language, hydrated, defaultLanguage]);

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Model Parameters Provider
interface ModelParametersProviderState {
  parameters: ModelParameters;
  setParameters: Dispatch<SetStateAction<ModelParameters>>;
}

const ModelParametersContext = createContext<ModelParametersProviderState | undefined>(undefined);

export function ModelParametersProvider({ children }: { children: ReactNode }) {
  const [parameters, setParameters] = useState<ModelParameters>(() => {
    if (typeof window === 'undefined') {
      return {
        temperature: 0.3,
        topP: 0.3,
        topK: 20,
        maxOutputTokens: 2048,
      };
    }
    try {
      const item = window.localStorage.getItem('model-parameters');
      const storedParams = item ? JSON.parse(item) : {};
      return {
        temperature: 0.3,
        topP: 0.3,
        topK: 20,
        maxOutputTokens: 2048,
        ...storedParams,
      };
    } catch (error) {
      console.error(error);
      return {
        temperature: 0.3,
        topP: 0.3,
        topK: 20,
        maxOutputTokens: 2048,
      };
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('model-parameters', JSON.stringify(parameters));
    } catch (error) {
      console.error(error);
    }
  }, [parameters]);

  const value = useMemo(() => ({ parameters, setParameters }), [parameters, setParameters]);

  return (
    <ModelParametersContext.Provider value={value}>
      {children}
    </ModelParametersContext.Provider>
  );
}

export const useModelParameters = () => {
  const context = useContext(ModelParametersContext);
  if (context === undefined) {
    throw new Error('useModelParameters must be used within a ModelParametersProvider');
  }
  return context;
};


// Combined Providers
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="energy-audit-theme">
      <LanguageProvider defaultLanguage="vn" storageKey="energy-audit-language">
        <ModelParametersProvider>
          {children}
        </ModelParametersProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

    