import { headers } from 'next/headers';
import { GeminiConfig, GeminiRecommendation, Product, QuizAnswer, QuizQuestion } from './schemas';

export async function getGeminiRecommendations(
  config: GeminiConfig,
  questions: QuizQuestion[] = [],
  answers: QuizAnswer[],
  products: Product[],
): Promise<GeminiRecommendation> {
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const forwardedProto = headersList.get('x-forwarded-proto');
  const protocol = forwardedProto || (host && (host.includes('localhost') || host.startsWith('127.0.0.1'))
    ? 'http'
    : 'https');
  const baseUrl = host ? `${protocol}://${host}` : undefined;
  const apiUrl = baseUrl ? `${baseUrl}/api/recommend` : '/api/recommend';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, products, config, questions }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error body:', errorText);
      throw new Error(`/api/recommend failed: ${response.status} ${response.statusText}`);
    }

    const recommendation = (await response.json()) as GeminiRecommendation;
    console.log('✅ /api/recommend responded successfully');
    return recommendation;
  } catch (error) {
    console.error('❌ /api/recommend error:', error instanceof Error ? error.message : error);
    console.log('⚠️ Falling back to tag-based recommendations');
    return getFallbackRecommendations(answers, products);
  }
}

function getFallbackRecommendations(
  answers: QuizAnswer[],
  products: Product[]
): GeminiRecommendation {
  const selectedTags = answers.flatMap(answer => answer.selectedOptions);

  // Score products based on tag matches
  const scoredProducts = products.map(product => {
    const matchingTags = product.tags.filter(tag => selectedTags.includes(tag));
    return {
      id: product.id,
      description: product.description,
      tags: product.tags,
    };
  });

  // Sort and take top 5
  const recommends = scoredProducts.slice(0, 5);

  return {
    recommends,
    reasoning: 'Recommendations based on your quiz answers and matching product attributes.',
  };
}
