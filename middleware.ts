import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { loadFullConfig, getSupportedLocales } from '@/lib/loadConfig';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const configParam = request.nextUrl.searchParams.get('config');

  // Get all locales from the bundled configuration (Edge-compatible)
  await loadFullConfig();
  const locales = getSupportedLocales();
  
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
