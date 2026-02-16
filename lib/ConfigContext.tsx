'use client';

import { createContext, useContext } from 'react';

export interface QuizConfig {
  configuration: {
    welcomePage: {
      title: string;
      description: string;
      whatToExpect: string;
      claimer: string;
    };
    resultPage: {
      successTitle: string;
      successDescription: string;
      noMatchesTitle: string;
      noMatchesDescription: string;
      bestMatchLabel: string;
      shopNowButtonText: string;
      retakeButtonText: string;
      browseAllButtonText: string;
      showPrice: boolean;
      showViewAllOptions: boolean;
    };
    gemini?: {
      enabled: boolean;
      model: string;
      apiKey: string;
      prompt: string;
    };
  };
  questions: Array<{
    id: string;
    text: string;
    type: 'single-select' | 'multi-select';
    options: Array<{
      id: string;
      text: string;
    }>;
  }>;
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    shopLink: string;
    tags: string[];
    attributes?: Record<string, string>;
  }>;
}

interface ConfigContextType {
  config: QuizConfig;
  locale: string;
  languages: string[];
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({
  children,
  config,
  locale,
  languages,
}: {
  children: React.ReactNode;
  config: QuizConfig;
  locale: string;
  languages: string[];
}) {
  return (
    <ConfigContext.Provider value={{ config, locale, languages }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
