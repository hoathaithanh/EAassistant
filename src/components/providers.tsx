
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
  t: (key: string, lang?: Language) => string;
}

const translations: Record<string, Record<Language, string>> = {
  appName: { en: 'Energy Audit Writing Assistant', vn: 'Trợ lý Soạn thảo Kiểm toán Năng lượng' },
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
  }, [storageKey, defaultLanguage, language]);

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
  
  const t = (key: string, langOverride?: Language) => {
    const effectiveLanguage = hydrated ? (langOverride || language) : defaultLanguage;
    return translations[key]?.[effectiveLanguage] || key;
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
