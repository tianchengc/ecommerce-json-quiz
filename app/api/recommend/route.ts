import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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

interface QuizAnswer {
  questionId: string;
  selectedOptions: string[];
}

interface QuizQuestion {
  id: string;
  text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
}

interface GeminiConfig {
  enabled: boolean;
  model: string;
  prompt: string;
}

interface GeminiRecommendation {
  productIds: string[];
  reasoning: string;
  guidance: string;
}

interface GeminiRequestBody {
  answers: QuizAnswer[];
  products: Product[];
  config: GeminiConfig;
  questions?: QuizQuestion[];
}

export const runtime = 'nodejs';

function jsonWithSource(data: GeminiRecommendation, source: 'gemini' | 'fallback') {
  return NextResponse.json(data, {
    headers: {
      'x-recommendation-source': source,
    },
  });
}

export async function POST(request: Request) {
  let body: GeminiRequestBody | null = null;

  try {
    body = (await request.json()) as GeminiRequestBody;
  } catch (error) {
    console.error('Failed to parse request body:', error);
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body || !Array.isArray(body.answers) || !Array.isArray(body.products)) {
    console.error('Missing required fields:', { hasAnswers: Array.isArray(body?.answers), hasProducts: Array.isArray(body?.products) });
    return NextResponse.json({ error: 'Missing answers or products.' }, { status: 400 });
  }

  const { answers, products, config, questions = [] } = body;

  console.log('=== API /recommend Debug ===');
  console.log('Config:', config);
  console.log('Config enabled:', config?.enabled);
  console.log('API key present:', !!process.env.GEMINI_API_KEY);
  console.log('API key length:', process.env.GEMINI_API_KEY?.length);

  const apiKey = process.env.GEMINI_API_KEY;

  if (!config?.enabled) {
    console.log('⚠️ Gemini disabled in config');
    return jsonWithSource(getFallbackRecommendations(answers, products), 'fallback');
  }

  if (!apiKey) {
    console.log('⚠️ GEMINI_API_KEY not set in environment');
    return jsonWithSource(getFallbackRecommendations(answers, products), 'fallback');
  }

  try {
    const selectedTags = answers.flatMap(answer => answer.selectedOptions);
    const questionMap = new Map(questions.map(question => [question.id, question]));
    const answerDetails = answers.map(answer => {
      const question = questionMap.get(answer.questionId);
      const selectedOptionTexts = answer.selectedOptions.map(optionId => {
        const option = question?.options.find(item => item.id === optionId);
        return option?.text || optionId;
      });

      return {
        questionId: answer.questionId,
        questionText: question?.text || answer.questionId,
        selectedOptionIds: answer.selectedOptions,
        selectedOptionTexts,
      };
    });

    const productCatalog = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      tags: product.tags,
      attributes: product.attributes,
    }));

    const systemPrompt = config.prompt ||
      "You are an expert product recommendation assistant. Analyze customer preferences from their quiz responses and match them with the most suitable products from the available catalog. Consider product attributes, tags, descriptions, and how they align with the customer's stated needs and preferences.";

    const userPrompt = `
      # Customer Quiz Responses (with question and answer text):
      ${JSON.stringify(answerDetails, null, 2)}

      # Customer Preference Tags (option ids):
      ${selectedTags.join(', ')}

      # Available Products:
      ${JSON.stringify(productCatalog, null, 2)}

      # Your Task:
      Analyze the customer's quiz responses and recommend 3-5 products from the catalog that best match their preferences.

      Consider:
      - Match product tags with the customer's selected preference tags
      - Analyze product attributes and descriptions for alignment
      - Prioritize products with the most relevant features for their needs

      # Response Format:
      Respond ONLY with valid JSON (no markdown, no code blocks, no additional text):
      {
        "productIds": ["product-id-1", "product-id-2", "product-id-3"],
        "reasoning": "Detailed explanation of why these products were selected based on their preferences and how each product's features align with their needs.",
        "guidance": "Personalized advice for using or enjoying these products based on their preferences."
      }
      `;

    const genAI = new GoogleGenAI({ apiKey });

    console.log('🚀 Calling Gemini with model:', config.model);
    const result = await genAI.models.generateContent({
      model: config.model,
      contents: systemPrompt + '\n\n' + userPrompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    console.log('✅ Gemini responded');
    const textResponse = result.text;
    console.log('Response text length:', textResponse?.length);

    if (!textResponse) {
      throw new Error('No response from Gemini');
    }

    let cleanedResponse = textResponse.trim();

    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recommendation = JSON.parse(jsonMatch[0]);
      return jsonWithSource(recommendation as GeminiRecommendation, 'gemini');
    }

    throw new Error('Could not parse Gemini response');
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.log('⚠️ Falling back to tag-based recommendations');
    return jsonWithSource(getFallbackRecommendations(answers, products), 'fallback');
  }
}

function getFallbackRecommendations(
  answers: QuizAnswer[],
  products: Product[]
): GeminiRecommendation {
  const selectedTags = answers.flatMap(answer => answer.selectedOptions);

  const scoredProducts = products.map(product => {
    const matchingTags = product.tags.filter(tag => selectedTags.includes(tag));
    return {
      product,
      score: matchingTags.length,
    };
  });

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
