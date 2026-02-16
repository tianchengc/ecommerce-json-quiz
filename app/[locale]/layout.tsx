import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { ConfigProvider } from '@/lib/ConfigContext';
import { loadQuizConfig, loadFullConfig, getFirstLanguage, getSupportedLocales, isValidLocale } from '@/lib/loadConfig';

export async function generateStaticParams() {
  // Load config to get supported locales dynamically
  const fullConfig = await loadFullConfig();
  const supportedLocales = getSupportedLocales(fullConfig);
  
  return supportedLocales.map((locale: string) => ({
    locale,
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { config?: string };
}): Promise<Metadata> {
  const { locale } = params;

  // Get config file from query parameter (e.g., ?config=quiz.json)
  const configFile = searchParams?.config;

  // Load full config to get first language
  const fullConfig = await loadFullConfig(configFile);

  if (fullConfig) {
    // Get the first language from the config
    const firstLanguage = getFirstLanguage(fullConfig);
    const defaultLangConfig = fullConfig[firstLanguage];

    if (defaultLangConfig?.configuration?.welcomePage) {
      const { welcomePage } = defaultLangConfig.configuration;
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
  params: { locale: string };
}) {
  const { locale } = params;

  // Get config file from header (set by middleware from query parameter)
  const headersList = headers();
  const configFile = headersList.get('x-config-file') || undefined;

  // Load full config to validate locale
  const fullConfig = await loadFullConfig(configFile);
  
  // Validate locale exists in config
  if (!fullConfig || !isValidLocale(locale, fullConfig)) {
    notFound();
  }

  // Load config with the specified config file or default
  const configData = await loadQuizConfig(locale, configFile);

  if (!configData) {
    return <div>Failed to load configuration</div>;
  }

  return (
    // Outer transparent box - 100% width and height
    <div lang={locale} className="w-full h-full min-h-screen bg-transparent flex items-center justify-center">
      {/* Inner constrained box - max dimensions, centered */}
      <div className="w-full h-full max-w-[640px] max-h-[720px] mx-auto bg-white flex flex-col justify-center">
        {/* Page Content */}
        <div className="flex-1 min-h-0 overflow-auto flex justify-center">
          <ConfigProvider config={configData} locale={locale} languages={getSupportedLocales(fullConfig)}>
            {children}
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
}
