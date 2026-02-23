import Link from 'next/link';
import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getGeminiRecommendations } from '@/lib/gemini';
import { loadLocaleConfig } from '@/lib/loadConfig';
import { Product, QuizAnswer, QuizQuestion } from '@/lib/schemas';
import ReactMarkdown from 'react-markdown';
import { ResultsSkeleton } from '@/components/ResultsSkeleton';

async function ResultsContent({
  locale,
  answers,
  config,
}: {
  locale: string;
  answers: QuizAnswer[];
  config: Awaited<ReturnType<typeof loadLocaleConfig>>;
}) {
  if (!config) notFound();

  const { configuration, products, questions } = config;
  const { resultPage, gemini } = configuration;

  const recommendations = await getGeminiRecommendations(
    gemini || { enabled: false, model: '', prompt: '' },
    (questions || []) as QuizQuestion[],
    answers,
    products as Product[]
  );

  // Map recommended ids to full product data
  const recommendedProducts = (recommendations.recommends || []).map((rec: any) => {
    const full = products.find((p: Product) => p.id === rec.id);
    return {
      ...rec,
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

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-5 lg:p-6 max-w-6xl mx-auto w-full">
          {/* Hero Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              {resultPage.successTitle}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {successDescription}
            </p>
          </div>

          {/* Product Grid - Primary Focus */}
          {recommendedProducts.length > 0 ? (
            <div className="mb-8 sm:mb-10 lg:mb-12">
              <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
                {recommendedProducts.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col lg:flex-row group min-h-0 lg:min-h-[200px]"
                  >

                    {/* Product Image (with possible Best Match overlay) */}
                    <div className="relative w-full h-48 sm:h-56 lg:h-auto lg:w-48 bg-gray-100 overflow-hidden flex-shrink-0 mx-auto lg:mx-0 lg:h-full flex items-stretch">
                      {/* Best Match Tag/Icon Overlay (moved here for correct stacking) */}
                      {index === 0 && (
                        <div className="absolute left-2 top-2 z-10">
                          <span className="flex items-center gap-1 bg-teal-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-md">
                            <span role="img" aria-label="Best Match">✨</span> {resultPage.bestMatchLabel}
                          </span>
                        </div>
                      )}
                      {product.shopLink ? (
                        <a
                          href={product.shopLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-full h-auto lg:h-full"
                          tabIndex={-1}
                          style={{ height: '100%' }}
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name || product.id}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 min-h-0 lg:min-h-full lg:h-full"
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
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 min-h-0 lg:min-h-full lg:h-full"
                            style={{ width: '100%', height: '100%', minHeight: 0, maxHeight: '100%' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">No Image</div>
                        )
                      )}
                    </div>

                    {/* Product Content */}
                    <div className="p-4 sm:p-5 flex flex-col flex-grow justify-center lg:pl-8">

                      {/* Title with Shop Icon */}
                      <div className="flex items-center mb-2 gap-2">
                        {product.shopLink ? (
                          <a
                            href={product.shopLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center group/title"
                          >
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 flex-grow group-hover/title:underline">
                              {product.name || product.id}
                            </h3>
                            <span className="ml-2 text-teal-600 hover:text-teal-800 flex items-center" title={resultPage.shopNowButtonText}>
                              {/* Shopping cart icon */}
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .96.343 1.09.835l.272 1.017m0 0L7.68 15.607A2.25 2.25 0 0 0 9.87 17.25h7.605a2.25 2.25 0 0 0 2.19-1.643l1.386-5.197a1.125 1.125 0 0 0-1.09-1.43H6.354m-1.306-4.128L6.354 6.75m0 0h14.396" />
                                <circle cx="9" cy="20" r="1.25" />
                                <circle cx="17" cy="20" r="1.25" />
                              </svg>
                            </span>
                          </a>
                        ) : (
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 flex-grow">
                            {product.name || product.id}
                          </h3>
                        )}
                      </div>


                      {/* Short Description */}
                      <span className="text-sm text-gray-600 mb-2 flex-grow">
                        {product.description}
                      </span>


                      {/* Keyword Tags */}
                      {product.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.tags.map((tag: string, i: number) => (
                            <span key={i} className="bg-teal-100 text-teal-700 text-xs px-2 py-0.5 rounded-full">
                              {tag.charAt(0).toUpperCase() + tag.slice(1)}
                            </span>
                          ))}
                        </div>
                      )}


                      {/* Shop Now Button removed, now shown as icon next to title */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 sm:p-10 text-center shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {resultPage.noMatchesTitle}
              </h2>
              <p className="text-gray-600 mb-6">
                {resultPage.noMatchesDescription}
              </p>
            </div>
          )}

          {/* AI Personalized Guidance Section removed for generic use case */}

          {/* AI Reasoning (Markdown) - More specific thinking path */}
          {recommendations.reasoning && (
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-5 sm:p-6 mb-8 border border-teal-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                {locale === 'fr' ? 'Comment avons-nous choisi?' : 'How We Chose'}
              </h3>
              <div className="text-sm sm:text-base text-gray-700 leading-relaxed">
                <ReactMarkdown>{recommendations.reasoning}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pb-4 sm:pb-6">
            <Link
              href={`/${locale}`}
              className="bg-teal-600 hover:bg-teal-700 text-white text-center font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {resultPage.retakeButtonText}
            </Link>
            {resultPage.showViewAllOptions && (
              <a
                href="#"
                className="border-2 border-teal-600 hover:bg-teal-50 text-teal-600 text-center font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
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
      <div className="w-full h-full flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {locale === 'fr' ? 'Aucune réponse fournie' : 'No Answers Provided'}
          </h1>
          <Link
            href={`/${locale}`}
            className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            {locale === 'fr' ? 'Recommencer le quiz' : 'Retake Quiz'}
          </Link>
        </div>
      </div>
    );
  }

  const answers: QuizAnswer[] = JSON.parse(decodeURIComponent(answersParam));
  const config = await loadLocaleConfig(locale);

  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsContent locale={locale} answers={answers} config={config} />
    </Suspense>
  );
}
