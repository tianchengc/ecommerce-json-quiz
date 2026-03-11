import Link from 'next/link';
import { notFound } from 'next/navigation';
import ResultsClient from '@/components/ResultsClient';
import { loadLocaleConfig } from '@/lib/loadConfig';
import { QuizAnswer } from '@/lib/schemas';

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ answers?: string }>;
}) {
  const { locale } = await params;
  const { answers: answersParam } = await searchParams;

  if (!answersParam) {
    return (
      <div className="w-full h-full flex items-start justify-start sm:items-center sm:justify-center bg-gray-50 px-4 pt-6 sm:pt-0">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {locale === 'fr' ? 'Aucune reponse fournie' : 'No Answers Provided'}
          </h1>
          <Link
            href={`/${locale}`}
            className="inline-block bg-teal-600 text-white text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            {locale === 'fr' ? 'Recommencer le quiz' : 'Retake Quiz'}
          </Link>
        </div>
      </div>
    );
  }

  let answers: QuizAnswer[] = [];
  try {
    answers = JSON.parse(decodeURIComponent(answersParam)) as QuizAnswer[];
  } catch {
    return (
      <div className="w-full h-full flex items-start justify-start sm:items-center sm:justify-center bg-gray-50 px-4 pt-6 sm:pt-0">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {locale === 'fr' ? 'Format des reponses invalide' : 'Invalid Answer Format'}
          </h1>
          <Link
            href={`/${locale}`}
            className="inline-block bg-teal-600 text-white text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            {locale === 'fr' ? 'Recommencer le quiz' : 'Retake Quiz'}
          </Link>
        </div>
      </div>
    );
  }

  const config = await loadLocaleConfig(locale);
  if (!config) notFound();

  return <ResultsClient locale={locale} answers={answers} config={config} />;
}
