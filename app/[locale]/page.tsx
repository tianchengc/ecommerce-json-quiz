'use client';

import Link from 'next/link';
import { useConfig } from '@/lib/ConfigContext';
import { LanguageSelector } from '@/components/LanguageSelectorLocale';

export default function WelcomePage() {
  const { config, locale, languages } = useConfig();
  const { welcomePage } = config.configuration;
  const expectationLines = welcomePage.whatToExpect.split('\n');

  return (
    <main className="h-full overflow-y-auto flex items-center justify-center bg-gray-50 p-4 sm:p-6">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6 sm:p-8 lg:p-10">
          {/* Language Selector - Top Right */}
          <div className="flex justify-end mb-4">
            <LanguageSelector currentLocale={locale} languages={languages}   />
          </div>
          {/* Welcome Content */}
          <div className="text-center space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
              {welcomePage.title}
            </h1>
            
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              {welcomePage.description}
            </p>

            {/* What to Expect */}
            <div className="bg-gray-100 rounded-lg p-4 sm:p-5 lg:p-6 my-4 sm:my-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                {locale === 'fr' ? 'À quoi s\'attendre' : 'What to Expect'}
              </h2>
              <ul className="space-y-2 text-left text-sm sm:text-base text-gray-700">
                {expectationLines.map((line: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-teal-600 mr-2 mt-0.5 flex-shrink-0">✓</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Start Button */}
            <Link
              href={`/${locale}/quiz`}
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-colors duration-200"
            >
              {locale === 'fr' ? 'Commencer le quiz' : 'Start Quiz'}
            </Link>

            {/* Claimer */}
            <p className="text-xs sm:text-sm text-gray-500 mt-3 px-4">
              {welcomePage.claimer}
            </p>
          </div>
        </div>
      </main>
  );
}
