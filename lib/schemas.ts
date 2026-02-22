export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  shopLink: string;
  tags: string[];
  attributes?: Record<string, string>;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'single-select' | 'multi-select';
  options: Array<{
    id: string;
    text: string;
  }>;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
}

export interface generalConfiguration {
  showFakeLoading: boolean;
}

export interface welcomePageConfiguration {
  title: string;
  description: string;
  whatToExpect: string;
  claimer: string;
  startQuizButtonText: string;
}

export interface GeminiConfig {
  enabled: boolean;
  model: string;
  prompt: string;
}

export interface resultPageConfiguration {
  showPrice: boolean;
  showViewAllOptions: boolean;
  loadingTitle: string;
  loadingDescription: string;
  noMatchesTitle: string;
  noMatchesDescription: string;
  successTitle: string;
  successDescription: string;
  bestMatchLabel: string;
  retakeButtonText: string;
  browseAllButtonText: string;
  shopNowButtonText: string;
  takeAgainButtonText: string;
}

export interface QuizLocaleConfig {
  configuration: {
    general: generalConfiguration;
    welcomePage: welcomePageConfiguration;
    resultPage: resultPageConfiguration;
    gemini?: GeminiConfig;
  };
  questions: Array<QuizQuestion>;
  products: Array<Product>;
}

export interface QuizConditions {
  anyOf?: string[];
  allOf?: string[];
  not?: string[];
}

export interface GeminiRecommendation {
  productIds: string[];
  reasoning: string;
  guidance: string;
}

export type LocalizedString = string | Record<string, string>;
export interface QuizResult {
  productId: string;
  productName: LocalizedString;
  productImage?: string;
  productDescription?: LocalizedString;
  price?: string;
  shopLink?: string;
  conditions: QuizConditions;
}

/**
 * Interface for the full quiz configuration.
 */
export interface FullQuizConfig {
  [locale: string]: QuizLocaleConfig;
}
