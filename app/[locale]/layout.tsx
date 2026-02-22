import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadFullConfig, getSupportedLocales, isValidLocale, loadLocaleConfig } from '@/lib/loadConfig';
import { QuizLocaleConfig } from '@/lib/schemas';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Load full config to validate locale
  const localeConfig: QuizLocaleConfig | null = await loadLocaleConfig(locale);

  if (localeConfig) {

    if (localeConfig?.configuration?.welcomePage) {
      const { welcomePage } = localeConfig.configuration;
      return {
        title: welcomePage.title,
        description: welcomePage.description,
      };
    }
  }

  // Fallback metadata
  return {
    title: 'Quiz - Find Your Perfect Match',
    description: 'Take our personalized quiz to discover products that match your preferences.',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const fullConfig = await loadFullConfig();

  // Validate locale exists in config
  if (!fullConfig || !isValidLocale(locale, fullConfig)) {
    notFound();
  }

  return (
    <div lang={locale} className="w-full h-full min-h-screen bg-transparent flex items-center justify-center">
      <div className="w-full h-full max-w-[640px] max-h-[720px] mx-auto bg-white flex flex-col justify-center">
        <div className="flex-1 min-h-0 overflow-auto flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
