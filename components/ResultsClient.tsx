"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import EmailResultButton from '@/components/EmailResultButton';
import { GeminiRecommendation, Product, QuizAnswer, QuizLocaleConfig, QuizQuestion } from '@/lib/schemas';

type ResultsClientProps = {
  locale: string;
  config: QuizLocaleConfig;
  answers: QuizAnswer[];
};

function buildFallbackThinking(lines: string[]): string {
  if (lines.length === 0) return '';
  return lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
}

export default function ResultsClient({ locale, config, answers }: ResultsClientProps) {
  const [recommendation, setRecommendation] = useState<GeminiRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [thinkingLines, setThinkingLines] = useState<string[]>([]);

  const { configuration, products, questions } = config;
  const { resultPage, gemini } = configuration;

  useEffect(() => {
    let isCancelled = false;

    const fetchStream = async () => {
      try {
        const response = await fetch('/api/recommend?stream=1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: gemini || { enabled: false, model: '', prompt: '' },
            questions: (questions || []) as QuizQuestion[],
            answers,
            products: products as Product[],
          }),
          cache: 'no-store',
        });

        if (!response.ok || !response.body) {
          throw new Error('Failed to start recommendation stream');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const event = JSON.parse(trimmed) as {
              type: 'status' | 'thinking' | 'result' | 'error';
              content?: string;
              data?: GeminiRecommendation;
            };

            if (isCancelled) return;

            if (event.type === 'status' && event.content) {
              setLoadingStatus(event.content);
              continue;
            }

            if (event.type === 'thinking' && event.content) {
              setThinkingLines((prev) => [...prev, event.content || '']);
              continue;
            }

            if (event.type === 'result' && event.data) {
              setRecommendation(event.data);
              setLoading(false);
              continue;
            }

            if (event.type === 'error' && event.content) {
              setLoadingStatus(event.content);
            }
          }
        }
      } catch (error) {
        if (isCancelled) return;

        setRecommendation({
          recommends: [],
          guidance: locale === 'fr'
            ? 'Nous avons rencontré un problème temporaire. Veuillez réessayer.'
            : 'We hit a temporary issue while generating recommendations. Please try again.',
          thinkingProcess: '',
        });
        setLoading(false);
      }
    };

    fetchStream();

    return () => {
      isCancelled = true;
    };
  }, [answers, gemini, locale, products, questions]);

  const thoughtMarkdown = useMemo(() => {
    return buildFallbackThinking(thinkingLines);
  }, [thinkingLines]);

  const derivedNotes = useMemo(
    () => answers.filter((a) => a.textContent?.trim()).map((a) => a.textContent!.trim()).join('\n\n'),
    [answers]
  );

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col bg-gray-50">
        <div className="flex-1 overflow-y-auto">
          <div className="pt-8 pb-12 p-4 sm:p-6 max-w-4xl mx-auto w-full">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{resultPage.loadingTitle}</h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{resultPage.loadingDescription}</p>
              <p className="text-sm text-teal-700 font-medium mb-4">{loadingStatus || (locale === 'fr' ? 'Analyse en cours...' : 'Analyzing...')}</p>

              <div className="rounded-lg border border-teal-100 bg-gradient-to-br from-teal-50 to-blue-50 p-4">
                <h2 className="text-sm font-semibold text-gray-800 mb-2">
                  {locale === 'fr' ? 'Processus de raisonnement IA (en direct)' : 'Live AI reasoning process'}
                </h2>
                <div className="text-sm text-gray-700 leading-relaxed">
                  <ReactMarkdown>
                    {thoughtMarkdown || (locale === 'fr' ? '1. Lecture de vos réponses.\n2. Analyse des signaux de préférence.\n3. Classement des produits les plus pertinents.' : '1. Reading your answers.\n2. Analyzing preference signals.\n3. Ranking the most relevant products.')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rec = recommendation || { recommends: [], guidance: '', thinkingProcess: '' };
  const recommendedProducts = (rec.recommends || []).map((item: any) => {
    const full = (products as Product[]).find((product) => product.id === item.id);
    return {
      ...item,
      image: full?.image,
      name: full?.name,
      price: full?.price,
      shopLink: full?.shopLink,
    };
  });

  const count = recommendedProducts.length;
  const plural = count === 1 ? '' : 's';
  const successDescription = resultPage.successDescription
    .replace('{count}', count.toString())
    .replace('{plural}', plural);

  const emailConfig = configuration.email;
  const sendResultButtonText = resultPage.sendResultButtonText || emailConfig?.ui?.buttonText;
  const showEmailButton = emailConfig?.enabled && emailConfig?.ui;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="pt-6 pb-8 sm:pt-10 sm:pb-12 lg:pt-16 lg:pb-20 p-4 sm:p-5 lg:p-6 max-w-6xl mx-auto w-full">
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">{resultPage.successTitle}</h1>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">{successDescription}</p>
          </div>

          {showEmailButton && (
            <div className="flex justify-center mb-6 sm:mb-8 lg:mb-10">
              <div className="w-full max-w-xs mx-auto">
                <EmailResultButton
                  ui={emailConfig.ui}
                  recommendations={recommendedProducts}
                  guidance={rec.guidance || ''}
                  thinkingProcess={rec.thinkingProcess || thoughtMarkdown}
                  notes={derivedNotes}
                  locale={locale}
                  sendResultButtonText={sendResultButtonText}
                />
              </div>
            </div>
          )}

          {rec.guidance && (
            <div className="bg-white rounded-xl p-5 sm:p-6 mb-6 border border-emerald-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {locale === 'fr' ? 'Conseils personnalisés' : 'Personalized Guidance'}
              </h2>
              <div className="text-sm sm:text-base text-gray-700 leading-relaxed">
                <ReactMarkdown>{rec.guidance}</ReactMarkdown>
              </div>
            </div>
          )}

          {recommendedProducts.length > 0 ? (
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6">
                {recommendedProducts.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col group min-h-0 h-full"
                  >
                    <div className="relative w-full h-32 sm:h-44 bg-gray-100 overflow-hidden flex-shrink-0 flex items-stretch">
                      {index === 0 && (
                        <div className="absolute left-2 top-2 z-10">
                          <span className="flex items-center gap-1 bg-teal-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-md">
                            <span role="img" aria-label="Best Match">*</span> {resultPage.bestMatchLabel}
                          </span>
                        </div>
                      )}
                      {product.shopLink ? (
                        <a
                          href={product.shopLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-full"
                          tabIndex={-1}
                          style={{ height: '100%' }}
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name || product.id}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              style={{ width: '100%', height: '100%', minHeight: 0, maxHeight: '100%' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">No Image</div>
                          )}
                        </a>
                      ) : (
                        product.image ? (
                          <img
                            src={product.image}
                            alt={product.name || product.id}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            style={{ width: '100%', height: '100%', minHeight: 0, maxHeight: '100%' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">No Image</div>
                        )
                      )}
                    </div>

                    <div className="p-3 sm:p-4 flex flex-col flex-grow">
                      <div className="flex items-center mb-2 gap-2">
                        {product.shopLink ? (
                          <a
                            href={product.shopLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center group/title"
                          >
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 flex-grow group-hover/title:underline">
                              {product.name || product.id}
                            </h3>
                          </a>
                        ) : (
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 flex-grow">
                            {product.name || product.id}
                          </h3>
                        )}
                      </div>

                      <span className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-3 flex-grow">{product.description}</span>

                      {product.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.tags.map((tag: string, i: number) => (
                            <span key={i} className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full">
                              {tag.charAt(0).toUpperCase() + tag.slice(1)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 sm:p-10 text-center shadow-sm mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{resultPage.noMatchesTitle}</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">{resultPage.noMatchesDescription}</p>
            </div>
          )}

          {(rec.thinkingProcess || thoughtMarkdown) && (
            <details className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-5 sm:p-6 mb-8 border border-teal-100">
              <summary className="cursor-pointer text-lg font-bold text-gray-900">
                {locale === 'fr' ? 'Processus d\'analyse IA (optionnel)' : 'AI analysis process (optional)'}
              </summary>
              <div className="text-sm sm:text-base text-gray-700 leading-relaxed mt-3">
                <ReactMarkdown>{rec.thinkingProcess || thoughtMarkdown}</ReactMarkdown>
              </div>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pb-4 sm:pb-6">
            <Link
              href={`/${locale}`}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base text-center font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200"
            >
              {resultPage.retakeButtonText}
            </Link>
            {resultPage.showViewAllOptions && (
              <a
                href="#"
                className="w-full sm:w-auto border-2 border-teal-600 hover:bg-teal-50 text-teal-600 text-sm sm:text-base text-center font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200"
              >
                {resultPage.browseAllButtonText}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
