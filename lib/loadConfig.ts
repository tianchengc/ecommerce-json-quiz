/**
 * Load the full quiz config file
 * 
 * Supports dynamic config loading via query parameter:
 * - URL: https://localhost:3000/en?config=quiz.json
 * - The caller should extract 'config' from searchParams and pass it here
 * 
 * @param configFile - Optional config filename (e.g., 'quiz.json', 'example.json')
 *                     If provided, loads from /public/config/{configFile}
 *                     If not provided, uses DEFAULT_CONFIG_FILE from .env
 *                     If DEFAULT_CONFIG_FILE not set, defaults to 'quiz.json'
 * @returns Full config object with all languages
 * 
 * @example
 * // In generateMetadata with query param
 * const configFile = searchParams?.config; // e.g., 'quiz.json'
 * const config = await loadFullConfig(configFile);
 */
export async function loadFullConfig(configFile?: string) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Use provided configFile or fall back to DEFAULT_CONFIG_FILE env variable
    const fileName = configFile || process.env.DEFAULT_CONFIG_FILE || 'example.json';
    const configPath = path.join(process.cwd(), 'public', 'config', fileName);
    
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return data;
  } catch (error) {
    console.error('Failed to load config:', error);
    return null;
  }
}

/**
 * Get all supported locales from a config object
 * @param config - Full config object with languages as top-level keys
 * @returns Array of locale codes (e.g., ['en', 'fr'])
 */
export function getSupportedLocales(config: any): string[] {
  if (!config) return ['en'];
  return Object.keys(config);
}

/**
 * Get the first language key from a config object
 */
export function getFirstLanguage(config: any): string {
  if (!config) return 'en';
  const languages = Object.keys(config);
  return languages.length > 0 ? languages[0] : 'en';
}

/**
 * Check if a locale is valid in the given config
 */
export function isValidLocale(locale: string, config: any): boolean {
  if (!config) return locale === 'en';
  return Object.keys(config).includes(locale);
}

/**
 * Load quiz config for a specific locale
 * @param locale - The locale to load config for
 * @param configFile - Optional config filename
 * @returns Config data for the specified locale
 */
export async function loadQuizConfig(locale: string, configFile?: string) {
  try {
    const fullConfig = await loadFullConfig(configFile);
    if (!fullConfig) return null;
    
    // Get the configuration for the selected locale, fallback to first language
    const firstLanguage = getFirstLanguage(fullConfig);
    const localeData = fullConfig[locale] || fullConfig[firstLanguage];
    return localeData;
  } catch (error) {
    console.error('Failed to load config:', error);
    return null;
  }
}
