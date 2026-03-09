import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadFullConfig, isValidLocale, loadLocaleConfig } from '@/lib/loadConfig';
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
  await loadFullConfig();

  // Validate locale exists in config
  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <div lang={locale} className="w-full h-full min-h-screen bg-transparent flex items-start justify-start sm:items-center sm:justify-center">
      <div className="w-full h-full max-w-[640px] mx-auto bg-white flex flex-col justify-start sm:justify-center">
        <div className="flex-1 min-h-0 overflow-auto flex justify-start sm:justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
