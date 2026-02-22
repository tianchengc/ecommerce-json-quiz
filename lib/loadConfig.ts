import 'server-only';
import { cache } from 'react';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { FullQuizConfig, QuizLocaleConfig } from './schemas';

// Singleton cache - loaded once and reused across all requests
let configSingleton: FullQuizConfig | null | undefined = undefined;

/**
 * Load the full quiz configuration from the filesystem.
 * Uses a singleton pattern - the file is read once on first call and cached
 * for the lifetime of the server process.
 *
 * Requires Node.js runtime. Remove `export const runtime = 'edge'` from any
 * layout or page that uses this function.
 */
export async function loadFullConfig(): Promise<FullQuizConfig | null> {
  // Return cached singleton if already loaded
  if (configSingleton !== undefined) {
    return configSingleton;
  }

  try {
    const fileName = process.env.DEFAULT_CONFIG_FILE || 'example.json'; // Should load example.json if no default config file is specified
    const configPath = join(process.cwd(), 'public', 'config', fileName);
    const fileContents = await readFile(configPath, 'utf-8');
    configSingleton = JSON.parse(fileContents) as FullQuizConfig;
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
 * The underlying `loadFullConfig()` uses a singleton, so the file is only
 * read once across all requests.
 */
export const loadLocaleConfig = cache(async (locale: string): Promise<QuizLocaleConfig | null> => {
  const fullConfig = await loadFullConfig();
  if (!fullConfig) return null;

  const localeData = fullConfig[locale] || fullConfig[Object.keys(fullConfig)[0]];
  return localeData || null;
});
