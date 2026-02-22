import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Get all locales from config file using fetch (Edge Runtime compatible)
async function getAllLocales(configFile: string, baseUrl: string): Promise<string[]> {
  try {
    const configUrl = `${baseUrl}/config/${configFile}`;
    const response = await fetch(configUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status}`);
    }
    const data = await response.json();
    return Object.keys(data);
  } catch (error) {
    console.error('Failed to load config:', error);
    return ['en']; // Fallback
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const configParam = request.nextUrl.searchParams.get('config');
  const configFile = configParam || process.env.DEFAULT_CONFIG_FILE || 'example.json';

  // Get base URL for fetching config
  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  // Get all locales to check if pathname already has one
  const locales = await getAllLocales(configFile, baseUrl);
  console.log('Middleware - Locales from config:', locales);
  console.log('Middleware - Incoming request pathname:', pathname);

  // Check if pathname already has a locale
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If already has locale, just pass through
  if (hasLocale) {
    return NextResponse.next();
  }

  // No locale in pathname, redirect to first locale
  const firstLocale = locales[0] || 'en';
  request.nextUrl.pathname = `/${firstLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc) and files with extensions
    '/((?!_next|api|favicon.ico|config|.*\\..*).*)',
  ],
};
