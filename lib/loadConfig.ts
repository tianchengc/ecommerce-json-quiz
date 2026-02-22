import 'server-only';
import { cache } from 'react';
import { FullQuizConfig, QuizLocaleConfig } from './schemas';

// 1. Statically import your JSON configurations here.
// This forces Next.js to bundle the JSON data directly into your JavaScript code!
// (Adjust the path if your file is located elsewhere)
import exampleConfig from '../public/config/example.json';
// import springTeaConfig from '../../public/config/spring-tea.json'; 

// 2. Create a registry to map the filenames to the imported data
const configRegistry: Record<string, FullQuizConfig> = {
  'example.json': exampleConfig as FullQuizConfig,
  // 'spring-tea.json': springTeaConfig as FullQuizConfig,
};

// Singleton cache - loaded once and reused across all requests
let configSingleton: FullQuizConfig | null | undefined = undefined;

/**
 * Load the full quiz configuration from memory.
 * Uses a singleton pattern - the registry is read once on first call and cached
 * for the lifetime of the server process.
 */
export async function loadFullConfig(): Promise<FullQuizConfig | null> {
  // Return cached singleton if already loaded
  if (configSingleton !== undefined) {
    return configSingleton;
  }

  try {
    const fileName = process.env.DEFAULT_CONFIG_FILE || 'example.json'; 
    
    // 3. Look up the config in our memory registry instead of reading the disk
    const selectedConfig = configRegistry[fileName];

    if (!selectedConfig) {
      throw new Error(`Configuration file ${fileName} not found in registry.`);
    }

    configSingleton = selectedConfig;
    return configSingleton;
  } catch (error) {
    console.error('Failed to load full config:', error);
    configSingleton = null;
    return null;
  }
}

/**
 * Get all supported locales from the full configuration.
 * @param config - The full quiz configuration.
 * @returns An array of supported locale strings.
 */
export function getSupportedLocales(config: FullQuizConfig): string[] {
  return config ? Object.keys(config) : ['en'];
}

/**
 * Check if a locale is valid in the given configuration.
 * @param locale - The locale to validate.
 * @param config - The full quiz configuration.
 * @returns True if the locale is valid, false otherwise.
 */
export function isValidLocale(locale: string, config: FullQuizConfig): boolean {
  return config ? Object.keys(config).includes(locale) : locale === 'en';
}

/**
 * Load the quiz configuration for a specific locale.
 * Uses React's `cache()` to deduplicate calls within the same request.
 */
export const loadLocaleConfig = cache(async (locale: string): Promise<QuizLocaleConfig | null> => {
  const fullConfig = await loadFullConfig();
  if (!fullConfig) return null;

  const localeData = fullConfig[locale] || fullConfig[Object.keys(fullConfig)[0]];
  return localeData || null;
});