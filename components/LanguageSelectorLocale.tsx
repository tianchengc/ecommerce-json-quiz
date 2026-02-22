'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface LanguageSelectorProps {
  currentLocale: string;
  languages: string[];
}

export function LanguageSelector({ currentLocale, languages }: LanguageSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLanguageChange = (newLocale: string) => {
  // pathname is already the localized path (e.g., /en/quiz)
  const segments = pathname.split('/').filter(Boolean);
  
  // Replace the first segment (the old locale) with the new one
  if (segments.length > 0) {
    segments[0] = newLocale;
  } else {
    segments.push(newLocale);
  }
  
  const newPath = `/${segments.join('/')}`;
  
  // searchParams is a read-only object in Next 15, stringify it safely
  const queryString = searchParams.toString();
  const fullPath = queryString ? `${newPath}?${queryString}` : newPath;
  
  // Use router.push for a faster, single-page-app transition
  router.push(fullPath);
};

  const currentLanguage = languages.find(lang => lang === currentLocale) || languages[0];

  return (
    <div className="relative inline-block">
      <select
        value={currentLocale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="appearance-none bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-white hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer transition-all shadow-sm"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.toUpperCase()} {/* Display language code in uppercase, e.g., EN, FR */}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-600">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
