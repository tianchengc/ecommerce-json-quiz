import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getGeminiRecommendations } from '@/lib/gemini';
import { loadLocaleConfig } from '@/lib/loadConfig';
import { Product, QuizAnswer, QuizQuestion } from '@/lib/schemas';
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

  const recommendedProducts = products.filter((p: Product) =>
    recommendations.productIds.includes(p.id)
  );

  const count = recommendedProducts.length;
  const plural = count === 1 ? '' : 's';
  const successDescription = resultPage.successDescription
    .replace('{count}', count.toString())
    .replace('{plural}', plural);

  // Extract guidance components from the full guidance text
  // Assumes format: "Temp: 190°F | Time: 5-7 mins | Ritual: Glass teapot..."
  const guidanceItems = recommendations.guidance?.split('|').map(item => item.trim()) || [];

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {recommendedProducts.map((product: Product, index: number) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col group"
                  >
                    {/* Best Match Badge */}
                    {index === 0 && (
                      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-center py-2 px-4 font-semibold text-sm">
                        ✨ {resultPage.bestMatchLabel}
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="relative h-40 sm:h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Content */}
                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Price */}
                      {resultPage.showPrice && product.price && (
                        <p className="text-xl sm:text-2xl font-bold text-teal-600 mb-3">
                          {product.price}
                        </p>
                      )}

                      {/* Description */}
                      <span className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                        {product.description}
                      </span>

                      {/* Why It's a Match */}
                      <div className="border-t border-gray-100 pt-3 mb-4 pb-2">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5 block">
                          {"Why it's a match"}
                        </span>
                        <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                          <li className="flex items-start">
                            <span className="text-teal-500 mr-2 flex-shrink-0">•</span>
                            <span>Perfectly aligned with your wellness preferences</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-teal-500 mr-2 flex-shrink-0">•</span>
                            <span>High-quality ingredients you selected</span>
                          </li>
                        </ul>
                      </div>

                      {/* Shop Button */}
                      <a
                        href={product.shopLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white text-center font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
                      >
                        {resultPage.shopNowButtonText}
                      </a>
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

          {/* AI Personalized Guidance Section */}
          {recommendations.guidance && (
            <div className="mb-8 sm:mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                ✨ {locale === 'fr' ? 'Conseils de préparation' : 'Your Brewing Guide'}
              </h2>
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
                <p className="text-gray-700 text-center leading-relaxed">
                  {recommendations.guidance}
                </p>
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          {recommendations.reasoning && (
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-5 sm:p-6 mb-8 border border-teal-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                {locale === 'fr' ? 'Comment avons-nous choisi?' : 'How We Chose'}
              </h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {recommendations.reasoning}
              </p>
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
