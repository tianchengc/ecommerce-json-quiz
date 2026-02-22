# Gemini AI Integration Guide

## Overview

This quiz application integrates Google's Gemini AI to provide intelligent, personalized product recommendations based on user quiz responses. The AI analyzes user preferences and matches them with products from your catalog to provide tailored guidance and recommendations.

## Features

- **AI-Powered Recommendations**: Gemini analyzes quiz answers to recommend the most suitable products
- **Personalized Guidance**: Provides custom tea/product guidance based on user preferences
- **Reasoning Explanations**: AI explains why specific products were recommended
- **Fallback System**: Automatic fallback to tag-based matching if AI is unavailable
- **Bilingual Support**: Works with both English and French configurations

## Configuration

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Set API Key

Add to your `.env` file:
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Configure in Config File

Add the Gemini configuration to your locale-specific config file (`public/config/quiz.json`):

```json
{
  "en": {
    "configuration": {
      "gemini": {
        "enabled": true,
        "model": "gemini-1.5-flash",
        "prompt": "You are an expert tea sommelier with deep knowledge..."
      }
    }
  }
}
```

### Configuration Options

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | Yes | Enable/disable Gemini AI recommendations |
| `model` | string | Yes | Gemini model name (use `gemini-1.5-flash` or `gemini-pro`) |
| `prompt` | string | Yes | System prompt that defines AI behavior |

### 3. Environment Variables (Recommended for Production)

For security, store your API key in environment variables:

**Create `.env.local`:**
```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Note:** The Gemini API key is read from `GEMINI_API_KEY` at runtime.

## How It Works

### 1. User Completes Quiz

User answers questions about their preferences:
- Goals (calming, energy, health, gifting)
- Flavor profiles (bold, light, fruity, etc.)
- Caffeine preferences
- Adventurousness level

### 2. Answers Sent to Gemini

The application sends:
- User's selected options
- Complete product catalog with metadata
- Custom prompt defining the recommendation task

### 3. AI Analysis

Gemini analyzes:
- User preference patterns
- Product attributes and tags
- Compatibility between preferences and products
- Optimal matches based on quiz responses

### 4. Recommendations Returned

Gemini provides:
- List of 3-5 recommended product IDs
- Reasoning for why products match
- Personalized guidance about user's preferences

### 5. Results Display

The app displays:
- Top recommended products with "Best Match" badge
- Product details (name, description, price, image)
- AI-generated guidance
- Reasoning explanation

## Prompt Engineering

### Writing Effective Prompts

The system prompt defines how Gemini interprets quiz answers and recommends products. Here's a template:

```text
You are a [product/tea] expert helping customers find their perfect [product/tea].

Based on the user's quiz answers about their:
- [Key Factor 1] (e.g., goals, purpose)
- [Key Factor 2] (e.g., taste profile, preferences)
- [Key Factor 3] (e.g., caffeine needs, dietary requirements)
- [Key Factor 4] (e.g., experience level, adventurousness)

Provide personalized [product/tea] recommendations from the available products.

Consider:
- [Important Consideration 1]
- [Important Consideration 2]
- [Important Consideration 3]

Provide specific [product/tea] suggestions with reasoning that explains why each product matches the user's needs and preferences.
```

### Example: Tea Quiz Prompt

```text
You are a tea expert helping customers find their perfect tea.

Based on the user's quiz answers about their preferences, taste profile, caffeine needs, and adventurousness, provide personalized tea recommendations from the available tea products.

Consider:
- Flavor profiles (bold/earthy, light/floral, fruity/sweet, roasted/nutty, citrusy/fresh)
- Caffeine preferences (full, light, or caffeine-free)
- Their goals (calming, energy, health benefits, gifting, exploration)
- Tea attributes like origin, processing method, and health properties

Provide specific tea suggestions with reasoning that explains why each tea matches their taste preferences and needs.
```

### Prompt Best Practices

1. **Be Specific**: Clearly define the AI's role and expertise area
2. **List Key Factors**: Enumerate what the AI should consider
3. **Set Context**: Explain the available data (quiz answers, product catalog)
4. **Define Output**: Specify what kind of recommendations and reasoning you expect
5. **Use Domain Language**: Include terminology relevant to your products
6. **Test Variations**: Try different prompts to see what works best

## Product Metadata

### Tags

Products use tags to enable AI matching. Tags should correspond to quiz option IDs:

```json
{
  "id": "product-001",
  "name": "Calming Rose Tea",
  "tags": ["calming", "light", "decaffeine", "floral"],
  "attributes": {
    "caffeine": "none",
    "profile": "floral",
    "purpose": "relaxation"
  }
}
```

### Attributes

Attributes provide additional context for AI analysis:

**Common Tea Attributes:**
```json
{
  "caffeine": "none" | "low" | "medium" | "high",
  "profile": "floral" | "earthy" | "fruity" | "nutty" | "fresh",
  "purpose": "relaxation" | "energy" | "health" | "gift",
  "origin": "China" | "Japan" | "India",
  "processing": "oxidized" | "steamed" | "fermented"
}
```

**General Product Attributes:**
```json
{
  "quality": "budget" | "standard" | "premium",
  "level": "beginner" | "intermediate" | "advanced",
  "category": "product-category-name",
  "season": "spring" | "summer" | "fall" | "winter"
}
```

## API Response Format

Gemini returns recommendations in JSON format:

```json
{
  "productIds": ["product-1", "product-2", "product-3"],
  "reasoning": "These teas were selected because you're looking for calming options...",
  "guidance": "Based on your preferences, we recommend starting with floral, caffeine-free teas..."
}
```

## Fallback System

If Gemini API is unavailable or disabled, the system automatically falls back to tag-based matching:

1. **Extract Tags**: Get all tags from user-selected options
2. **Score Products**: Calculate how many tags each product matches
3. **Sort by Score**: Rank products by number of matching tags
4. **Return Top 5**: Show the highest-scoring products

This ensures the quiz always provides recommendations, even without AI.

## Cost Management

### Gemini API Pricing

- **Free Tier**: 60 requests per minute
- **Paid Tier**: Pay-as-you-go pricing
- See [Google AI Pricing](https://ai.google.dev/pricing) for current rates

### Optimization Tips

1. **Rate Limiting**: Implement rate limiting to prevent excessive API calls
2. **Caching**: Cache recommendations for identical answer combinations
3. **Token Optimization**: Keep prompts concise to reduce token usage
4. **Fallback First**: Test with fallback mode before enabling AI
5. **Monitor Usage**: Track API calls and costs in Google Cloud Console

### Implementing Caching

```typescript
// Example caching implementation
const cache = new Map<string, GeminiRecommendation>();

function getCacheKey(answers: QuizAnswer[]): string {
  return JSON.stringify(answers.sort());
}

async function getCachedRecommendations(
  answers: QuizAnswer[],
  products: Product[],
  config: GeminiConfig
): Promise<GeminiRecommendation> {
  const cacheKey = getCacheKey(answers);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  
  const recommendations = await getGeminiRecommendations(answers, products, config);
  cache.set(cacheKey, recommendations);
  
  return recommendations;
}
```

## Testing

### 1. Test with Disabled AI

Set `enabled: false` to test the fallback system:

```json
{
  "gemini": {
    "enabled": false
  }
}
```

Verify that:
- Tag-based matching works correctly
- Products are ranked by tag matches
- Top products are relevant to quiz answers

### 2. Test with AI Enabled

Enable Gemini and test various answer combinations:

```bash
# Test different user profiles
- User seeking energy boost → Should recommend caffeinated products
- User wanting relaxation → Should recommend calming, caffeine-free options
- Gift seeker → Should recommend popular, gift-appropriate options
- Adventurous user → Should recommend unique, exotic options
```

### 3. Test Error Handling

Simulate API failures:
- Invalid API key → Should fall back to tag matching
- Network timeout → Should fall back gracefully
- Malformed response → Should handle errors and use fallback

### 4. Test Bilingual Support

Test with both English and French:
- Verify prompts are language-appropriate
- Check that reasoning and guidance are in the correct language
- Ensure recommendations are consistent across languages

## Troubleshooting

### Issue: No Recommendations Returned

**Possible Causes:**
- Invalid API key
- API quota exceeded
- Network connectivity issues

**Solutions:**
1. Check API key in Google Cloud Console
2. Verify API key has correct permissions
3. Check network connectivity
4. Review console logs for error messages
5. Test fallback system

### Issue: Irrelevant Recommendations

**Possible Causes:**
- Prompt needs refinement
- Product metadata insufficient
- Tags don't match option IDs

**Solutions:**
1. Review and refine system prompt
2. Add more product attributes
3. Ensure tags align with quiz options
4. Test with different prompt variations
5. Review Gemini response in logs

### Issue: Slow Performance

**Possible Causes:**
- Large product catalog
- Complex prompt
- Network latency

**Solutions:**
1. Reduce product catalog size in prompt
2. Simplify system prompt
3. Implement caching
4. Use pagination for large catalogs
5. Consider edge functions for faster response

### Issue: High API Costs

**Solutions:**
1. Implement caching to reduce duplicate calls
2. Use rate limiting to control usage
3. Optimize prompt to reduce tokens
4. Consider using fallback for some users
5. Monitor usage in Google Cloud Console

## Advanced Features

### Custom Scoring

Combine AI recommendations with custom business logic:

```typescript
function rankRecommendations(
  aiRecommendations: string[],
  products: Product[],
  businessRules: BusinessRules
): Product[] {
  const ranked = aiRecommendations.map(id => {
    const product = products.find(p => p.id === id);
    const score = calculateScore(product, businessRules);
    return { product, score };
  });
  
  return ranked
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}
```

### A/B Testing

Test AI recommendations vs. tag-based matching:

```typescript
const useAI = Math.random() > 0.5; // 50/50 split

const recommendations = useAI
  ? await getGeminiRecommendations(answers, products, config)
  : getFallbackRecommendations(answers, products);

// Track which method performs better
analytics.track('recommendations_method', {
  method: useAI ? 'ai' : 'fallback',
  conversionRate: trackConversion()
});
```

### Multi-Model Support

Support different AI models:

```json
{
  "gemini": {
    "enabled": true,
    "models": {
      "default": "gemini-pro",
      "advanced": "gemini-pro-vision"
    }
  }
}
```

## Security Best Practices

1. **Never Commit API Keys**: Use environment variables
2. **Rate Limiting**: Implement server-side rate limiting
3. **Input Validation**: Validate all user inputs
4. **CORS Configuration**: Restrict API calls to your domain
5. **Monitor Usage**: Set up alerts for unusual activity
6. **Rotate Keys**: Periodically rotate API keys

## Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Best Practices for Prompts](https://ai.google.dev/docs/prompt_best_practices)

## Support

For issues related to:
- **Gemini API**: Check [Google AI Documentation](https://ai.google.dev/docs)
- **Configuration**: See [CONFIG-FILE-REFERENCE.md](./CONFIG-FILE-REFERENCE.md)
- **Implementation**: Review [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)

---

**Last Updated:** 2026-02-15  
**Version:** 2.0.0
