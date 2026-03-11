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

export interface QuizQuestionOption {
  id: string;
  text: string;
}

export interface BaseQuizQuestion {
  id: string;
  text: string;
  helperText?: string;
}

export interface SelectQuizQuestion extends BaseQuizQuestion {
  type: 'single-select' | 'multi-select';
  options: QuizQuestionOption[];
}

export interface TextareaQuizQuestion extends BaseQuizQuestion {
  type: 'textarea';
  placeholder?: string;
  maxLength?: number;
}

export type QuizQuestion = SelectQuizQuestion | TextareaQuizQuestion;

export interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
  textContent?: string;
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
  sendResultButtonText?: string;
}

export interface EmailUIConfig {
  buttonText: string;
  modalTitle: string;
  modalDescription: string;
  emailPlaceholder: string;
  sendButton: string;
  sendingText: string;
  successMessage: string;
  errorMessage: string;
}

export interface EmailTemplateConfig {
  brandName?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  footerText?: string;
}

export interface EmailConfig {
  enabled: boolean;
  adminEmail: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  ui: EmailUIConfig;
  template?: EmailTemplateConfig;
}

export interface QuizLocaleConfig {
  configuration: {
    general: generalConfiguration;
    welcomePage: welcomePageConfiguration;
    resultPage: resultPageConfiguration;
    email: EmailConfig;
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

export interface GeminiRequestBody {
  answers: QuizAnswer[];
  products: Product[];
  config: GeminiConfig;
  questions?: QuizQuestion[];
}

export interface ProductRecommendation {
  id: string;
  description: string;
  tags: string[];
}

export interface GeminiRecommendation {
  recommends: ProductRecommendation[];
  guidance?: string;
  thinkingProcess?: string; // streamed model analysis in markdown
  reasoning?: string; // backward-compat legacy field
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
