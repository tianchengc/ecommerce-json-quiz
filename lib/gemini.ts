import { headers } from 'next/headers';
import { GeminiConfig, GeminiRecommendation, Product, QuizAnswer, QuizQuestion } from './schemas';

export async function getGeminiRecommendations(
  config: GeminiConfig,
  questions: QuizQuestion[] = [],
  answers: QuizAnswer[],
  products: Product[],
): Promise<GeminiRecommendation> {
  console.log('=== Gemini Recommendations Debug ===');
  console.log('Config:', config);
  console.log('Config enabled:', config?.enabled);
  console.log('Config model:', config?.model);
  console.log('Answers count:', answers?.length);
  console.log('Products count:', products?.length);
  console.log('Questions count:', questions?.length);

  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const forwardedProto = headersList.get('x-forwarded-proto');
  const protocol = forwardedProto || (host && (host.includes('localhost') || host.startsWith('127.0.0.1'))
    ? 'http'
    : 'https');
  const baseUrl = host ? `${protocol}://${host}` : undefined;

  console.log('Request headers - host:', host, 'proto:', forwardedProto);
  console.log('Resolved baseUrl:', baseUrl);

  const apiUrl = baseUrl ? `${baseUrl}/api/recommend` : '/api/recommend';
  console.log('Final API URL:', apiUrl);

  try {
    console.log('🚀 Calling Gemini API route:', apiUrl);
    console.log('Request body config:', { enabled: config?.enabled, model: config?.model });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers,
        products,
        config,
        questions,
      }),
      cache: 'no-store',
    });

    console.log('API response status:', response.status, response.statusText);
    console.log('Recommendation source header:', response.headers.get('x-recommendation-source'));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error body:', errorText);
      throw new Error(`Gemini API route failed: ${response.status} ${response.statusText}`);
    }

    const recommendation = (await response.json()) as GeminiRecommendation;
    console.log('✅ Gemini API route responded successfully');
    console.log('Recommendation:', recommendation);
    return recommendation;
  } catch (error) {
    console.error('❌ Gemini API route error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.log('⚠️ Falling back to tag-based recommendations');
    return getFallbackRecommendations(answers, products);
  }
}

function getFallbackRecommendations(
  answers: QuizAnswer[],
  products: Product[]
): GeminiRecommendation {
  // Extract selected tags from answers
  const selectedTags = answers.flatMap(answer => answer.selectedOptions);

  // Score products based on tag matches
  const scoredProducts = products.map(product => {
    const matchingTags = product.tags.filter(tag => selectedTags.includes(tag));
    return {
      product,
      score: matchingTags.length,
    };
  });

  // Sort by score and take top 5
  const recommendations = scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.product.id);

  return {
    productIds: recommendations,
    reasoning: 'Recommendations based on your quiz answers and matching product attributes.',
    guidance: 'These products align with your preferences and needs. Explore each option to find your perfect match!',
  };
}
