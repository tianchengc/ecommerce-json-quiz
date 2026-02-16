import Link from 'next/link';
import Image from 'next/image';
import { getGeminiRecommendations } from '@/lib/gemini';
import { loadQuizConfig } from '@/lib/loadConfig';

interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  shopLink: string;
  tags: string[];
  attributes?: Record<string, string>;
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { answers?: string };
}) {
  const { locale } = params;
  const answersParam = searchParams.answers;

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
            {locale === 'fr' ? 'Recommencer' : 'Start Quiz'}
          </Link>
        </div>
      </div>
    );
  }

  const answers: QuizAnswer[] = JSON.parse(decodeURIComponent(answersParam));
  const configData = await loadQuizConfig(locale);

  if (!configData) {
    return <div>Configuration not found</div>;
  }

  const { configuration, products } = configData;
  const { resultPage, gemini } = configuration;

  // Get AI-powered recommendations
  const recommendations = await getGeminiRecommendations(
    answers,
    products,
    gemini || { enabled: false, model: '', apiKey: '', prompt: '' }
  );

  const recommendedProducts = products.filter((p: Product) =>
    recommendations.productIds.includes(p.id)
  );

  const count = recommendedProducts.length;
  const plural = count === 1 ? '' : 's';
  const successDescription = resultPage.successDescription
    .replace('{count}', count.toString())
    .replace('{plural}', plural);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Container with scrolling */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {resultPage.successTitle}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-4">{successDescription}</p>
          </div>

          {/* AI Guidance */}
          {recommendations.guidance && (
            <div className="bg-gray-100 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                {locale === 'fr' ? '🌟 Votre guide personnalisé' : '🌟 Your Personalized Guidance'}
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{recommendations.guidance}</p>
            </div>
          )}

          {/* Product Grid */}
          {recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {recommendedProducts.map((product: Product, index: number) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {index === 0 && (
                    <div className="bg-teal-600 text-white text-center py-1.5 px-3 font-semibold text-xs sm:text-sm">
                      {resultPage.bestMatchLabel}
                    </div>
                  )}
                  
                  <div className="relative h-40 sm:h-48 bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {resultPage.showPrice && product.price && (
                      <p className="text-lg sm:text-xl font-bold text-teal-600 mb-2">
                        {product.price}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <a
                      href={product.shopLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-teal-600 text-white text-center font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors duration-200 text-xs sm:text-sm"
                    >
                      {resultPage.shopNowButtonText}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 sm:p-8 text-center shadow-md mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                {resultPage.noMatchesTitle}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                {resultPage.noMatchesDescription}
              </p>
            </div>
          )}

          {/* AI Reasoning */}
          {recommendations.reasoning && (
            <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 shadow-md">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2">
                {locale === 'fr' ? '💡 Pourquoi ces produits ?' : '💡 Why These Products?'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{recommendations.reasoning}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center px-2 pb-3 sm:pb-4">
            <Link
              href={`/${locale}`}
              className="bg-teal-600 text-white text-center font-semibold py-2 sm:py-2.5 px-5 sm:px-6 rounded-lg hover:bg-teal-700 transition-colors duration-200 text-sm"
            >
              {resultPage.retakeButtonText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
