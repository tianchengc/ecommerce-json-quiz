import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { loadFullConfig, getFirstLanguage } from '@/lib/loadConfig';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  // Load config from DEFAULT_CONFIG_FILE env variable
  const fullConfig = await loadFullConfig();
  
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
    title: 'Tea Quiz Widget - Find Your Perfect Tea',
    description: 'Take our personalized quiz to discover teas that match your taste preferences.',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
