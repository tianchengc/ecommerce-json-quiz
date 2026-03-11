import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { GeminiRecommendation, GeminiRequestBody, Product, QuizAnswer, QuizQuestion } from '@/lib/schemas';

export const runtime = 'nodejs';

type GeminiExecutionResult = {
  recommendation: GeminiRecommendation;
  source: 'gemini' | 'fallback';
  thoughtParts: string[];
};

function jsonWithSource(data: GeminiRecommendation, source: 'gemini' | 'fallback') {
  return NextResponse.json(data, {
    headers: {
      'x-recommendation-source': source,
    },
  });
}

function extractNotesFromAnswers(answers: QuizAnswer[]): string {
  return answers
    .filter((a) => a.textContent?.trim())
    .map((a) => a.textContent!.trim())
    .join('\n\n');
}

function getPromptPayload(
  answers: QuizAnswer[],
  questions: QuizQuestion[],
  products: Product[],
  notes: string,
  basePrompt?: string
) {
  const selectedTags = answers.flatMap((answer) => answer.selectedOptions);
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const answerDetails = answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    const options = question && 'options' in question ? question.options : [];
    const selectedOptionTexts = answer.selectedOptions.map((optionId) => {
      const option = options.find((item) => item.id === optionId);
      return option?.text || optionId;
    });

    return {
      questionId: answer.questionId,
      questionText: question?.text || answer.questionId,
      selectedOptionIds: answer.selectedOptions,
      selectedOptionTexts,
    };
  });

  const productCatalog = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    tags: product.tags,
    attributes: product.attributes,
  }));

  const systemPrompt =
    basePrompt ||
    `You are a product recommendation assistant.
- Analyze customer quiz responses and match them with products from the catalog.
- For each recommended product, provide a short description (1-2 sentences) and keyword tags.
- Provide a short guidance field (2-4 sentences) with practical next-step advice.
- Do not include chain-of-thought in final JSON. Keep the final response concise.
- Respond ONLY with valid JSON (no markdown code fences around it).`;

  const userPrompt = `
# Customer Quiz Responses (with question and answer text)
${JSON.stringify(answerDetails, null, 2)}

# Customer Preference Tags (option ids)
${selectedTags.join(', ')}

# Customer Extra Notes
${notes.trim() ? notes : 'No extra notes provided.'}

# Available Products
${JSON.stringify(productCatalog, null, 2)}

# Task
Recommend 3-6 products from the catalog that best match the customer profile.

# Response format (strict JSON only)
{
  "recommends": [
    {
      "id": "product-id-1",
      "description": "Short description for product 1",
      "tags": ["tag1", "tag2"]
    }
  ],
  "guidance": "Short practical advice based on quiz answers and notes"
}
`;

  return { systemPrompt, userPrompt };
}

function toThinkingMarkdown(thoughtParts: string[], notes: string): string {
  if (thoughtParts.length > 0) {
    return thoughtParts.map((line, index) => `${index + 1}. ${line}`).join('\n');
  }

  if (notes.trim()) {
    return '1. Parsed your quiz answers and extra notes.\n2. Matched intent, constraints, and product tags.\n3. Ranked products by fit and variety.';
  }

  return '1. Parsed your quiz answers.\n2. Matched preference signals against product tags.\n3. Ranked products by fit and variety.';
}

function parseRecommendationPayload(rawText: string): GeminiRecommendation {
  let cleanedResponse = rawText.trim();
  if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  }

  const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not find JSON object in Gemini response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as GeminiRecommendation;
  if (!Array.isArray(parsed.recommends) || parsed.recommends.length === 0) {
    throw new Error('Gemini response did not include recommendations');
  }

  return parsed;
}

async function runGeminiRecommendation(
  body: GeminiRequestBody,
  onThought?: (thought: string) => void
): Promise<GeminiExecutionResult> {
  const { answers, products, config, questions = [] } = body;
  const notes = extractNotesFromAnswers(answers);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!config?.enabled || !apiKey) {
    return {
      recommendation: getFallbackRecommendations(answers, products),
      source: 'fallback',
      thoughtParts: [],
    };
  }

  const { systemPrompt, userPrompt } = getPromptPayload(answers, questions, products, notes, config.prompt);
  const genAI = new GoogleGenAI({ apiKey });

  const stream = await genAI.models.generateContentStream({
    model: config.model,
    contents: `${systemPrompt}\n\n${userPrompt}`,
    config: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      thinkingConfig: {
        includeThoughts: true,
        thinkingBudget: 1024,
      },
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
          guidance: { type: Type.STRING },
        },
        required: ['recommends'],
      },
    },
  });

  let fullText = '';
  const thoughtParts: string[] = [];

  for await (const chunk of stream) {
    const chunkText = (chunk as any)?.text;
    if (typeof chunkText === 'string') {
      fullText += chunkText;
    }

    const parts = (chunk as any)?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
      for (const part of parts) {
        const isThought = Boolean(part?.thought);
        const thoughtText = typeof part?.text === 'string' ? part.text.trim() : '';
        if (isThought && thoughtText) {
          thoughtParts.push(thoughtText);
          onThought?.(thoughtText);
        }
      }
    }
  }

  if (!fullText.trim()) {
    throw new Error('No response from Gemini stream');
  }

  const recommendation = parseRecommendationPayload(fullText);
  recommendation.thinkingProcess = toThinkingMarkdown(thoughtParts, notes);
  recommendation.guidance =
    recommendation.guidance ||
    'Use your top match first, then compare the next 1-2 options based on flavor, caffeine level, and intended usage.';

  return {
    recommendation,
    source: 'gemini',
    thoughtParts,
  };
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
    console.error('Missing required fields:', {
      hasAnswers: Array.isArray(body?.answers),
      hasProducts: Array.isArray(body?.products),
    });
    return NextResponse.json({ error: 'Missing answers or products.' }, { status: 400 });
  }

  const streamRequested = new URL(request.url).searchParams.get('stream') === '1';

  if (!streamRequested) {
    try {
      const result = await runGeminiRecommendation(body);
      return jsonWithSource(result.recommendation, result.source);
    } catch (error) {
      console.error('Gemini API error:', error);
      return jsonWithSource(getFallbackRecommendations(body.answers, body.products), 'fallback');
    }
  }

  const encoder = new TextEncoder();
  const notes = extractNotesFromAnswers(body.answers);

  const responseStream = new ReadableStream({
    async start(controller) {
      const write = (payload: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      };

      try {
        write({ type: 'status', content: 'Analyzing preferences...' });

        const result = await runGeminiRecommendation(body, (thought) => {
          write({ type: 'thinking', content: thought });
        });

        write({
          type: 'result',
          source: result.source,
          data: {
            ...result.recommendation,
            thinkingProcess: result.recommendation.thinkingProcess || toThinkingMarkdown(result.thoughtParts, notes),
          },
        });
      } catch (error) {
        const fallback = getFallbackRecommendations(body.answers, body.products);
        write({ type: 'error', content: 'Using fallback recommendations.' });
        write({ type: 'result', source: 'fallback', data: fallback });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'x-recommendation-source': 'stream',
    },
  });
}

function getFallbackRecommendations(
  answers: QuizAnswer[],
  products: Product[]
): GeminiRecommendation {
  const selectedTags = answers.flatMap((answer) => answer.selectedOptions);
  const notes = extractNotesFromAnswers(answers);

  const scoredProducts = products
    .map((product) => {
      const score = product.tags.filter((tag) => selectedTags.includes(tag)).length;
      return {
        id: product.id,
        description: product.description,
        tags: product.tags,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  const recommends = scoredProducts.slice(0, 5).map(({ id, description, tags }) => ({
    id,
    description,
    tags,
  }));

  return {
    recommends,
    guidance: notes.trim()
      ? 'I incorporated your note in addition to your quiz answers. Start with the top match and compare alternatives based on your specific constraints.'
      : 'These recommendations are based on your selected options and matching product attributes. Start with the top result and compare 1-2 alternatives.',
    thinkingProcess: toThinkingMarkdown([], notes),
  };
}
