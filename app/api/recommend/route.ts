import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { GeminiRecommendation, GeminiRequestBody, Product, QuizAnswer } from '@/lib/schemas';

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

  const apiKey = process.env.GEMINI_API_KEY;

  if (!config?.enabled || !apiKey) {
    const fallbackSource = !config?.enabled ? 'fallback (Gemini disabled)' : 'fallback (API key missing)';
    console.log(`⚠️ Using fallback: ${fallbackSource}`);
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
      `You are a product recommendation assistant. Your job is to:
      - Analyze customer quiz responses and match them with the best products from the catalog.
      - For each recommended product, provide:
        - a short description (1-2 sentences, highglight key features)
        - a list of keyword tags (usage, features, characteristics, etc.)
        - a markdown reason why it matches
      - Also, provide a markdown explanation of your specific thinking path for why you chose these products for the user.
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
        "recommends": [
          {
            "id": "product-id-1",
            "description": "Short description for product 1",
            "tags": ["tag1", "tag2"]
          },
          ...
        ],
        "reasoning": "How We Chose (markdown)"
      }
      `;

    const genAI = new GoogleGenAI({ apiKey });

    const result = await genAI.models.generateContent({
      model: config.model,
      contents: systemPrompt + '\n\n' + userPrompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'description', 'tags'],
              },
            },
            reasoning: { type: Type.STRING },
          },
          required: ['recommends', 'reasoning'],
        },
      },
    });

    const textResponse = result.text;
    console.log('✅ Gemini responded:', textResponse);

    if (!textResponse) {
      throw new Error('No response from Gemini');
    }

    let cleanedResponse = textResponse.trim();
    console.log('After trim:', cleanedResponse);

    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      console.log('After markdown cleanup:', cleanedResponse);
    }
    
    // Try to parse JSON
    let recommendation: GeminiRecommendation | null = null;
    
    // First try to find and extract JSON object
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('Matched JSON string (first 200 chars):', jsonMatch[0].substring(0, 200));
      try {
        recommendation = JSON.parse(jsonMatch[0], (key, value) => {
          // Validate structure has required fields
          if (key === '' && (!Array.isArray(value.recommends) || typeof value.reasoning !== 'string')) {
            console.warn('⚠️ Recommendation missing required fields, attempting to repair...');
            // Provide defaults if missing
            return {
              recommends: Array.isArray(value.recommends) ? value.recommends : [],
              reasoning: typeof value.reasoning === 'string' ? value.reasoning : 'Based on your preferences'
            };
          }
          return value;
        });
        console.log('Successfully parsed recommendation');
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        recommendation = null;
      }
    }
    
    if (recommendation && recommendation.recommends && recommendation.recommends.length > 0) {
      console.log(`Got ${recommendation.recommends.length} recommendations from Gemini`);
      return jsonWithSource(recommendation, 'gemini');
    }

    throw new Error('Could not parse Gemini response: ' + (cleanedResponse.substring(0, 100) || 'empty'));
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
      id: product.id,
      description: product.description,
      tags: product.tags,
    };
  });

  const recommends = scoredProducts.slice(0, 5);

  return {
    recommends,
    reasoning: 'These products were chosen by matching your answers to product features, usage, and characteristics. Each product highlights key aspects that align with your needs.',
  };
}
