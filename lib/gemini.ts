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

interface GeminiConfig {
  enabled: boolean;
  model: string;
  apiKey: string;
  prompt: string;
}

interface GeminiRecommendation {
  productIds: string[];
  reasoning: string;
  guidance: string;
}

export async function getGeminiRecommendations(
  answers: QuizAnswer[],
  products: Product[],
  config: GeminiConfig
): Promise<GeminiRecommendation> {
  if (!config.enabled || !config.apiKey || config.apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log('Gemini is disabled or API key not configured, using fallback recommendations');
    return getFallbackRecommendations(answers, products);
  }

  try {
    // Extract selected options from answers
    const selectedTags = answers.flatMap(answer => answer.selectedOptions);

    // Prepare product catalog for Gemini
    const productCatalog = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      tags: p.tags,
      attributes: p.attributes,
    }));

    // Construct the prompt
    const systemPrompt = config.prompt;
    const userPrompt = `
User selected these options in the quiz: ${selectedTags.join(', ')}

Available products:
${JSON.stringify(productCatalog, null, 2)}

Based on the user's selections, please:
1. Recommend the top 3-5 most suitable products by their IDs
2. Provide reasoning for each recommendation
3. Give personalized guidance about their preferences

Respond in JSON format:
{
  "productIds": ["product-id-1", "product-id-2", "product-id-3"],
  "reasoning": "Explanation of why these products match",
  "guidance": "Personalized tea guidance for the user"
}
`;

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt + '\n\n' + userPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0]?.content?.parts[0]?.text;

    if (!textResponse) {
      throw new Error('No response from Gemini');
    }

    // Parse JSON response from Gemini
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recommendation = JSON.parse(jsonMatch[0]);
      return recommendation as GeminiRecommendation;
    }

    throw new Error('Could not parse Gemini response');
  } catch (error) {
    console.error('Gemini API error:', error);
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
