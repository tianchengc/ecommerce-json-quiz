// Multi-language support types
export type LocalizedString = string | Record<string, string>;

export interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
}

export interface QuizConditions {
  anyOf?: string[];
  allOf?: string[];
  not?: string[];
}

export interface QuizResult {
  productId: string;
  productName: LocalizedString;
  productImage?: string;
  productDescription?: LocalizedString;
  price?: string;
  shopLink?: string;
  conditions: QuizConditions;
}

export interface QuizQuestion {
  id: string;
  text: LocalizedString;
  type: 'single-select' | 'multi-select';
  options: Array<{
    id: string;
    text: LocalizedString;
  }>;
}

export interface generalConfiguration {
  showFakeLoading: boolean;
}

export interface welcomePageConfiguration {
  title: string;
  description: string;
  whatToExpect: string;
  claimer: string;
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

export interface QuizTranslations {
  en: {
    welcomePage: welcomePageConfiguration;
    resultPage: resultPageConfiguration;
  };
  fr?: {
    welcomePage: welcomePageConfiguration;
    resultPage: resultPageConfiguration;
  };
  [key: string]: {
    welcomePage: welcomePageConfiguration;
    resultPage: resultPageConfiguration;
  } | undefined;
}

export interface QuizConfiguration {
  defaultLanguage?: string;
  availableLanguages?: string[];
  general: generalConfiguration;
  // Support both old and new format
  welcomePage?: welcomePageConfiguration;
  resultPage?: resultPageConfiguration;
  translations?: QuizTranslations;
}

export interface QuizData {
  configuration: QuizConfiguration;
  questions: QuizQuestion[];
  results: QuizResult[];
}

/**
 * Gets the localized string value with fallback support
 * @param value - Can be a string or an object with language keys
 * @param language - The desired language code (e.g., 'en', 'fr')
 * @param defaultLanguage - Fallback language (default: 'en')
 * @returns The localized string
 */
export function getLocalizedString(
  value: LocalizedString,
  language: string = 'en',
  defaultLanguage: string = 'en'
): string {
  // If it's already a string, return it (backward compatibility)
  if (typeof value === 'string') {
    return value;
  }

  // Try to get the requested language
  if (value[language]) {
    return value[language];
  }

  // Fall back to default language
  if (value[defaultLanguage]) {
    return value[defaultLanguage];
  }

  // Fall back to English if default language not found
  if (value['en']) {
    return value['en'];
  }

  // Return the first available language as last resort
  const firstKey = Object.keys(value)[0];
  return value[firstKey] || '';
}

/**
 * Gets the configuration for a specific language with fallback
 * @param config - Quiz configuration
 * @param language - Desired language
 * @returns Combined configuration object
 */
export function getLocalizedConfiguration(
  config: QuizConfiguration,
  language: string
): QuizConfiguration {
  const defaultLang = config.defaultLanguage || 'en';

  // If old format (no translations), return as-is
  if (!config.translations) {
    return config;
  }

  // Get translations for the requested language, or fallback
  const translations = config.translations[language] || config.translations[defaultLang] || config.translations['en'];

  if (!translations) {
    // Return old format if it exists
    if (config.welcomePage && config.resultPage) {
      return config;
    }
    throw new Error('No valid configuration found');
  }

  return {
    ...config,
    welcomePage: translations.welcomePage,
    resultPage: translations.resultPage
  };
}

/**
 * Evaluates quiz conditions against user answers
 */
export function evaluateConditions(
  conditions: QuizConditions,
  userAnswers: QuizAnswer[]
): boolean {
  // Flatten all selected options from user answers
  const allSelectedOptions = userAnswers.reduce((acc, answer) => {
    return [...acc, ...answer.selectedOptions];
  }, [] as string[]);

  // Check anyOf conditions (at least one must match)
  const anyOfMatch = !conditions.anyOf || 
    conditions.anyOf.some(option => allSelectedOptions.includes(option));

  // Check allOf conditions (all must match)
  const allOfMatch = !conditions.allOf || 
    conditions.allOf.every(option => allSelectedOptions.includes(option));

  // Check not conditions (none must match)
  const notMatch = !conditions.not || 
    !conditions.not.some(option => allSelectedOptions.includes(option));

  return anyOfMatch && allOfMatch && notMatch;
}

/**
 * Finds matching products based on user answers
 */
export function findMatchingProducts(
  quizData: QuizData,
  userAnswers: QuizAnswer[]
): QuizResult[] {
  return quizData.results.filter(result => 
    evaluateConditions(result.conditions, userAnswers)
  );
}

/**
 * Calculates match score for a product (for ranking)
 */
export function calculateMatchScore(
  result: QuizResult,
  userAnswers: QuizAnswer[]
): number {
  const allSelectedOptions = userAnswers.reduce((acc, answer) => {
    return [...acc, ...answer.selectedOptions];
  }, [] as string[]);

  let score = 0;
  
  // Add points for anyOf matches
  if (result.conditions.anyOf) {
    const anyOfMatches = result.conditions.anyOf.filter(option => 
      allSelectedOptions.includes(option)
    ).length;
    score += anyOfMatches * 2;
  }
  
  // Add points for allOf matches
  if (result.conditions.allOf) {
    const allOfMatches = result.conditions.allOf.filter(option => 
      allSelectedOptions.includes(option)
    ).length;
    score += allOfMatches * 3;
  }
  
  // Subtract points for not violations
  if (result.conditions.not) {
    const notViolations = result.conditions.not.filter(option => 
      allSelectedOptions.includes(option)
    ).length;
    score -= notViolations * 5;
  }
  
  return score;
}

/**
 * Gets recommended products with ranking
 */
export function getRecommendations(
  quizData: QuizData,
  userAnswers: QuizAnswer[],
  maxResults: number = 3
): QuizResult[] {
  const matchingProducts = findMatchingProducts(quizData, userAnswers);
  
  // Sort by match score (highest first)
  const scoredProducts = matchingProducts.map(product => ({
    ...product,
    score: calculateMatchScore(product, userAnswers)
  }));
  
  scoredProducts.sort((a, b) => b.score - a.score);
  
  return scoredProducts.slice(0, maxResults);
}

/**
 * Validates quiz answer format
 */
export function validateQuizAnswer(
  answer: QuizAnswer,
  question: QuizQuestion
): boolean {
  if (!answer.selectedOptions || answer.selectedOptions.length === 0) {
    return false;
  }
  
  if (question.type === 'single-select' && answer.selectedOptions.length > 1) {
    return false;
  }
  
  // Check if all selected options are valid
  const validOptionIds = question.options.map(option => option.id);
  return answer.selectedOptions.every(optionId => 
    validOptionIds.includes(optionId)
  );
}

/**
 * Utility function to simulate loading delay
 */
export function simulateLoading(ms: number = 1500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
