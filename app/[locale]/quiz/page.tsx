import { notFound } from 'next/navigation';
import QuizComponent from '@/components/QuizForm';
import { loadLocaleConfig } from '@/lib/loadConfig';

export default async function QuizPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const config = await loadLocaleConfig(locale);

  if (!config) notFound();

  return <QuizComponent config={config} locale={locale} />;
}
