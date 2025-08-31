import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Language,
  TranslationKeys,
  translations,
  getSavedLanguagePreference,
  saveLanguagePreference
} from './i18n';

// 语言上下文类型
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationKeys;
  isLoading: boolean;
}

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 语言提供者组件
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh');
  const [isLoading, setIsLoading] = useState(true);

  // 初始化语言设置
  useEffect(() => {
    const initLanguage = async () => {
      try {
        const savedLanguage = getSavedLanguagePreference();
        setLanguageState(savedLanguage);
      } catch (error) {
        console.error('Failed to load language preference:', error);
        setLanguageState('zh');
      } finally {
        setIsLoading(false);
      }
    };

    initLanguage();
  }, []);

  // 设置语言并保存偏好
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    saveLanguagePreference(newLanguage);

    // 更新HTML lang属性
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLanguage === 'zh' ? 'zh-CN' : 'en';
    }
  };

  // 获取当前语言的翻译
  const t = translations[language];

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// 使用语言Hook
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// 便捷的翻译Hook
export const useTranslation = () => {
  const { t, language, setLanguage } = useLanguage();
  return { t, language, setLanguage };
};
