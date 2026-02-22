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
  reasons: Record<string, string>; // productId -> markdown reason
  guidance: string; // brew guide, markdown
  reasoning: string; // how we chose, markdown
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
      `You are an expert tea and wellness product recommendation assistant. Your job is to:
      - Analyze customer quiz responses and match them with the best products from the catalog.
      - For each recommended product, provide a short, markdown-formatted reason (1-2 lines, bullet or sentence) why it matches the user's preferences (keywords, features, or benefits).
      - Write a short, markdown-formatted brewing guide for the recommended teas ("Your Brewing Guide").
      - Write a short, markdown-formatted explanation of how you chose these products ("How We Chose").
      - Keep all markdown simple and readable for end users.
      - Respond ONLY with valid JSON (no markdown/code blocks around it).
      `;

    const userPrompt = `
      # Customer Quiz Responses (with question and answer text):
      ${JSON.stringify(answerDetails, null, 2)}

      # Customer Preference Tags (option ids):
      ${selectedTags.join(', ')}

      # Available Products:
      ${JSON.stringify(productCatalog, null, 2)}

      # Your Task:
      Recommend 3-5 products from the catalog that best match the customer's preferences.

      # Response Format:
      Respond ONLY with valid JSON (no markdown, no code blocks, no additional text):
      {
        "productIds": ["product-id-1", "product-id-2", "product-id-3"],
        "reasons": { "product-id-1": "- Reason for product 1 (markdown)", ... },
        "guidance": "Your Brewing Guide (markdown)",
        "reasoning": "How We Chose (markdown)"
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
      reason: matchingTags.length > 0
        ? `- Matched tags: ${matchingTags.join(', ')}`
        : '- General fit for your preferences',
    };
  });

  const recommendations = scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const productIds = recommendations.map(item => item.product.id);
  const reasons: Record<string, string> = {};
  recommendations.forEach(item => {
    reasons[item.product.id] = item.reason;
  });

  return {
    productIds,
    reasons,
    guidance: '• Use fresh, filtered water.\n• Steep at the recommended temperature and time for best flavor.\n• Enjoy your tea mindfully!',
    reasoning: 'Products were selected based on the number of matching tags with your quiz answers. The more tags matched, the higher the product appears in your results.',
  };
}
