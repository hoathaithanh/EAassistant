
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';

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
  copiedOutputDescription: { en: 'The generated text has been copied to your clipboard.', vn: 'Nội dung tạo ra đã được sao chép vào bộ nhớ tạm.' },
  copiedResearchDescription: { en: 'The research results have been copied to your clipboard.', vn: 'Kết quả tìm kiếm đã được sao chép vào bộ nhớ tạm.' },
  failedToCopy: { en: 'Failed to copy text to clipboard.', vn: 'Không thể sao chép nội dung.' },
  clipboardApiUnavailable: { en: 'Clipboard access is unavailable. This may require HTTPS or browser permissions.', vn: 'Không thể truy cập clipboard. Tính năng này có thể yêu cầu HTTPS hoặc quyền truy cập của trình duyệt.' },
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
  unknownError: { en: 'An unknown error occurred.', vn: 'Đã xảy ra lỗi không xác định.'},
  aiServiceOverloadedError: {
    en: 'The AI service is currently overloaded or unavailable. Please try again in a few moments.',
    vn: 'Dịch vụ AI hiện đang quá tải hoặc không khả dụng. Vui lòng thử lại sau ít phút.'
  },
  english: { en: 'English', vn: 'Tiếng Anh' },
  vietnamese: { en: 'Vietnamese', vn: 'Tiếng Việt' },
  inputPlaceholder: { en: 'Enter your audit report content here...', vn: 'Nhập nội dung báo cáo kiểm toán của bạn tại đây...' },
  outputPlaceholder: { en: 'AI generated content will appear here...', vn: 'Nội dung do AI tạo sẽ xuất hiện ở đây...' },
  aiToolsLabel: { en: 'AI Tools', vn: 'Công cụ AI'},
  inputRequiredTitle: { en: 'Input Required', vn: 'Yêu cầu nhập liệu' },
  inputRequiredDescription: { en: 'Please enter some text to process.', vn: 'Vui lòng nhập nội dung để xử lý.' },
  generatedTextRequiredTitle: { en: 'Generated Text Required', vn: 'Yêu cầu nội dung đã tạo' },
  generatedTextRequiredDescription: { en: 'Please generate some text first before searching for related documents.', vn: 'Vui lòng tạo nội dung trước khi tìm kiếm tài liệu liên quan.' },
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
    let finalLanguage = defaultLanguage; 
    try {
      const storedLanguage = localStorage.getItem(storageKey) as Language | null;
      if (storedLanguage && translations['appName']?.[storedLanguage]) {
        finalLanguage = storedLanguage;
      } else {
        localStorage.setItem(storageKey, defaultLanguage);
      }
    } catch (e) {
      console.error("Failed to access localStorage for language setting:", e);
    }
    setLanguageState(finalLanguage);
    setHydrated(true);
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
      translation = translations[key]?.[langOrParams] || key;
    }
    return translation;
  };


  const value = useMemo(() => ({
    language: hydrated ? language : defaultLanguage,
    setLanguage,
    toggleLanguage,
    t,
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

// Combined Providers
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="energy-audit-theme">
      <LanguageProvider defaultLanguage="vn" storageKey="energy-audit-language">
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
