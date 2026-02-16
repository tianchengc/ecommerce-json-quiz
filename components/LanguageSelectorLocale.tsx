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
    // Get current pathname
    const currentPath = pathname;
    
    // Split path and filter out empty strings
    const segments = currentPath.split('/').filter(Boolean);
    
    // Build path without locale (everything after first segment)
    const pathWithoutLocale = segments.length > 1 
      ? '/' + segments.slice(1).join('/')
      : '';
    
    // Build complete new path
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    // Preserve query parameters
    const queryString = searchParams.toString();
    const fullPath = queryString ? `${newPath}?${queryString}` : newPath;
    
    // Use absolute URL to prevent relative path issues
    const absoluteUrl = `${window.location.origin}${fullPath}`;
    window.location.href = absoluteUrl;
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
