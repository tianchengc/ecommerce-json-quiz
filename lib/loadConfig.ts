import 'server-only';
import { cache } from 'react';
import { FullQuizConfig, QuizLocaleConfig } from './schemas';

// 1. Statically import your JSON configurations here.
// This forces Next.js to bundle the JSON data directly into your JavaScript code!
// (Adjust the path if your file is located elsewhere)
import exampleConfig from '../public/config/example.json';
import quizConfig from '../public/config/quiz.json'; 

// 2. Create a registry to map the filenames to the imported data
const configRegistry: Record<string, FullQuizConfig> = {
  'example.json': exampleConfig as FullQuizConfig,
  'quiz.json': quizConfig as FullQuizConfig,
};

// Singleton cache - loaded once and reused across all requests
let configSingleton: FullQuizConfig | null | undefined = undefined;

/**
 * Load the full quiz configuration from memory.
 * Uses a singleton pattern - the registry is read once on first call and cached
 * for the lifetime of the server process.
 * @param specificFileName - Optional filename to load (must be in configRegistry)
 */
export async function loadFullConfig(specificFileName?: string | null): Promise<FullQuizConfig | null> {
  const fileName = specificFileName || process.env.DEFAULT_CONFIG_FILE || 'example.json';

  // Return cached singleton if already loaded and matches the fileName
  // If we are requesting a specific file but singleton has another, we reload
  if (configSingleton !== undefined && (!specificFileName || fileName === process.env.DEFAULT_CONFIG_FILE)) {
    return configSingleton;
  }

  try {
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
 * @returns An array of supported locale strings.
 */
export function getSupportedLocales(): string[] {
  return configSingleton ? Object.keys(configSingleton) : ['en'];
}

/**
 * Check if a locale is valid in the given configuration.
 * @param locale - The locale to validate.
 * @returns True if the locale is valid, false otherwise.
 */
export function isValidLocale(locale: string): boolean {
  return configSingleton ? Object.keys(configSingleton).includes(locale) : locale === 'en';
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