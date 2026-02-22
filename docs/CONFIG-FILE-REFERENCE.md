# Configuration File Reference

## Overview

This document provides a comprehensive reference for the quiz configuration file structure. The configuration file uses a language-block structure where each language has its own complete configuration, making it easy to maintain and extend multi-language support.

## File Structure

The configuration file is a JSON file with language codes as root keys. Each language block contains:
- `configuration`: App settings and UI text
- `questions`: Quiz questions array
- `products`: Available products for recommendations

```json
{
  "en": {
    "configuration": { /* English configuration */ },
    "questions": [ /* English questions */ ],
    "products": [ /* Product list */ ]
  },
  "fr": {
    "configuration": { /* French configuration */ },
    "questions": [ /* French questions */ ],
    "products": [ /* Product list */ ]
  }
}
```

## Language Block Structure

### Root Level

Each language code (e.g., `en`, `fr`, `es`, `de`) is a root-level key containing a complete,independent configuration for that language.

**Supported Language Codes:**
- `en` - English
- `fr` - French
- `es` - Spanish
- `de` - German
- `zh` - Chinese
- `ja` - Japanese
- Any ISO 639-1 language code

## Configuration Section

The `configuration` object contains all app settings and UI text for that language.

### Structure

```json
{
  "configuration": {
    "general": { /* General settings */ },
    "welcomePage": { /* Welcome page text */ },
    "resultPage": { /* Results page text */ },
    "email": { /* Email settings (optional) */ },
    "gemini": { /* Gemini AI settings (optional) */ }
  }
}
```

### General Settings

```json
{
  "general": {
    "showFakeLoading": true
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `showFakeLoading` | boolean | Yes | Enable simulated loading animation for better UX |

### Welcome Page Settings

```json
{
  "welcomePage": {
    "title": "Find Your Perfect Tea",
    "description": "Take our personalized quiz...",
    "whatToExpect": "Line 1\nLine 2\nLine 3",
    "claimer": "No signup required • 100% free"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Main heading on welcome page |
| `description` | string | Yes | Subtitle/description text |
| `whatToExpect` | string | Yes | Bullet points (use `\n` for new lines) |
| `claimer` | string | Yes | Footer text (use `•` for separators) |

### Result Page Settings

```json
{
  "resultPage": {
    "showPrice": false,
    "showViewAllOptions": false,
    "loadingTitle": "Finding Your Perfect Match...",
    "loadingDescription": "Analyzing your preferences...",
    "noMatchesTitle": "No Perfect Matches Found",
    "noMatchesDescription": "Try adjusting your answers...",
    "successTitle": "Your Perfect Tea",
    "successDescription": "We found {count} perfect tea{plural} for you.",
    "bestMatchLabel": "Best Match",
    "retakeButtonText": "Retake Quiz",
    "browseAllButtonText": "Browse All Teas",
    "shopNowButtonText": "Shop Now",
    "takeAgainButtonText": "Take Quiz Again"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `showPrice` | boolean | Yes | Display product prices in results |
| `showViewAllOptions` | boolean | Yes | Show "View All" button |
| `loadingTitle` | string | Yes | Title during loading animation |
| `loadingDescription` | string | Yes | Description during loading |
| `noMatchesTitle` | string | Yes | Title when no matches found |
| `noMatchesDescription` | string | Yes | Description for no matches |
| `successTitle` | string | Yes | Title when matches found |
| `successDescription` | string | Yes | Description with placeholders: `{count}`, `{plural}` |
| `bestMatchLabel` | string | Yes | Badge text for best match |
| `retakeButtonText` | string | Yes | Button text to retake quiz |
| `browseAllButtonText` | string | Yes | Button text to browse all products |
| `shopNowButtonText` | string | Yes | Button text for product links |
| `takeAgainButtonText` | string | Yes | Alternative retake button text |

**Placeholder Variables:**
- `{count}` - Number of matched products
- `{plural}` - Empty string if count=1, otherwise 's'

### Email Settings (Optional)

```json
{
  "email": {
    "enabled": false,
    "adminEmail": "admin@yourdomain.com",
    "fromEmail": "noreply@yourdomain.com",
    "fromName": "Quiz Widget",
    "subject": "New Quiz Results Submitted"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | Yes | Enable email notifications |
| `adminEmail` | string | If enabled | Recipient email address |
| `fromEmail` | string | If enabled | Sender email address |
| `fromName` | string | If enabled | Sender display name |
| `subject` | string | If enabled | Email subject line |

### Gemini AI Settings (Optional)

```json
{
  "gemini": {
    "enabled": true,
    "model": "gemini-pro",
    "prompt": "You are a tea expert helping customers..."
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | boolean | Yes | Enable Gemini AI recommendations |
| `model` | string | If enabled | Gemini model name (`gemini-pro`, `gemini-pro-vision`) |
| `prompt` | string | If enabled | System prompt for AI recommendations |

**Note:** Store API keys in environment variables in production.

## Questions Section

The `questions` array contains quiz questions. Each question must have a unique `id`.

### Question Structure

```json
{
  "id": "q1",
  "text": "What brings you here today?",
  "type": "multi-select",
  "options": [
    { "id": "option1", "text": "🧘 First option" },
    { "id": "option2", "text": "💪 Second option" }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique question identifier (e.g., `q1`, `q2`) |
| `text` | string | Yes | Question text displayed to user |
| `type` | string | Yes | `"single-select"` or `"multi-select"` |
| `options` | array | Yes | Array of option objects |

### Option Structure

```json
{
  "id": "option1",
  "text": "🧘 Option text with emoji"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique option identifier within question |
| `text` | string | Yes | Option text (emojis recommended for visual appeal) |

**Best Practices:**
- Use descriptive IDs that match the meaning (e.g., `calming`, `energy`, `gift`)
- Keep question text concise (under 100 characters)
- Use emojis to make options more engaging
- Limit to 5-7 options per question for best UX

## Products Section

The `products` array contains all available products for recommendations. Products should be the same across all languages, with translated `name` and `description` fields.

### Product Structure

```json
{
  "id": "product-001",
  "name": "Premium Product Name",
  "image": "https://example.com/image.jpg",
  "description": "Product description text",
  "price": "$49.99",
  "shopLink": "https://store.com/product",
  "tags": ["tag1", "tag2", "tag3"],
  "attributes": {
    "caffeine": "medium",
    "profile": "floral",
    "purpose": "relaxation"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique product identifier (must match across languages) |
| `name` | string | Yes | Product name (translated) |
| `image` | string | Yes | Full URL to product image |
| `description` | string | Yes | Product description (translated) |
| `price` | string | Yes | Price with currency symbol |
| `shopLink` | string | Yes | URL to product page |
| `tags` | array | Yes | Tags matching option IDs for recommendations |
| `attributes` | object | No | Custom attributes for AI recommendations |

### Tags

Tags are used to match products with user selections. Each tag should correspond to an option `id` from the questions.

**Example:**
```json
"tags": ["calming", "light", "decaffeine", "gift"]
```

If a user selects options with IDs `calming` and `decaffeine`, products with those tags will be recommended.

**Special Tags:**
- `popular` - Popular/bestseller products
- `universal` - Products suitable for all users
- `bestseller` - Top-selling products

### Attributes

Custom attributes provide additional metadata for AI-powered recommendations. These are flexible key-value pairs.

**Common Attributes for Tea Products:**
```json
{
  "caffeine": "none" | "low" | "medium" | "high",
  "profile": "floral" | "earthy" | "fruity" | "nutty" | "fresh",
  "purpose": "relaxation" | "energy" | "health" | "gift"
}
```

**Common Attributes for General Products:**
```json
{
  "quality": "budget" | "standard" | "premium",
  "level": "beginner" | "intermediate" | "advanced",
  "type": "category-name"
}
```

## Complete Example

See `config/example.json` and `config/quiz.json` for complete working examples.

### Minimal Example

```json
{
  "en": {
    "configuration": {
      "general": {
        "showFakeLoading": true
      },
      "welcomePage": {
        "title": "Find Your Match",
        "description": "Answer questions to get recommendations.",
        "whatToExpect": "Quick questions\nPersonalized results\nTakes 2 minutes",
        "claimer": "Free • No signup required"
      },
      "resultPage": {
        "showPrice": true,
        "showViewAllOptions": true,
        "loadingTitle": "Finding Your Match...",
        "loadingDescription": "Analyzing preferences...",
        "noMatchesTitle": "No Matches Found",
        "noMatchesDescription": "Try different answers.",
        "successTitle": "Your Match",
        "successDescription": "Found {count} product{plural}.",
        "bestMatchLabel": "Best Match",
        "retakeButtonText": "Retake",
        "browseAllButtonText": "Browse All",
        "shopNowButtonText": "Shop Now",
        "takeAgainButtonText": "Try Again"
      }
    },
    "questions": [
      {
        "id": "q1",
        "text": "What do you need?",
        "type": "single-select",
        "options": [
          { "id": "option1", "text": "🎯 Option 1" },
          { "id": "option2", "text": "⭐ Option 2" }
        ]
      }
    ],
    "products": [
      {
        "id": "product-1",
        "name": "Product Name",
        "image": "https://example.com/image.jpg",
        "description": "Product description.",
        "price": "$29.99",
        "shopLink": "https://store.com/product",
        "tags": ["option1"],
        "attributes": {
          "type": "standard"
        }
      }
    ]
  }
}
```

## Loading Configuration

The application loads the configuration based on the user's selected language:

1. User selects language (e.g., `en` or `fr`)
2. Application loads `/config/quiz.json` or `/config/example.json`
3. Application extracts the language block: `configData[selectedLanguage]`
4. All text, questions, and products are now in the selected language

## Migration from Old Format

If you have the old format with `availableLanguages` and nested `translations`, follow these steps:

1. **Create language blocks** at root level
2. **Move configuration.translations[lang]** to `[lang].configuration`
3. **Translate questions**: Convert `text: {en: "...", fr: "..."}` to separate language blocks
4. **Translate products**: Create separate product entries in each language block
5. **Remove** `availableLanguages` and `defaultLanguage` fields

**Old Format:**
```json
{
  "configuration": {
    "availableLanguages": ["en", "fr"],
    "translations": {
      "en": { /* settings */ },
      "fr": { /* settings */ }
    }
  },
  "questions": [
    {
      "text": { "en": "Question?", "fr": "Question?" }
    }
  ]
}
```

**New Format:**
```json
{
  "en": {
    "configuration": { /* settings */ },
    "questions": [
      { "text": "Question?" }
    ]
  },
  "fr": {
    "configuration": { /* settings */ },
    "questions": [
      { "text": "Question?" }
    ]
  }
}
```

## Best Practices

### General
- Keep all language blocks in sync (same question/product IDs)
- Use meaningful IDs (not just `q1`, `q2`)
- Test with all languages before deployment

### Questions
- Limit to 4-6 questions for best completion rates
- Mix single-select and multi-select for variety
- Use clear, concise language
- Add emojis for visual appeal

### Products
- Use high-quality images (minimum 600x600px)
- Write compelling descriptions (50-150 characters)
- Ensure tags accurately match product characteristics
- Test recommendation logic with various answer combinations

### Translations
- Use native speakers for translations
- Maintain consistent tone across languages
- Adapt idioms and cultural references
- Test UI with longest translations (usually German/French)

### AI Integration
- Craft detailed prompts with examples
- Include product catalog information in prompt
- Test with various answer combinations
- Monitor API usage and costs

## Validation

To validate your configuration file:

1. **JSON Syntax**: Use a JSON validator
2. **Required Fields**: Ensure all required fields are present
3. **Unique IDs**: All question and product IDs must be unique
4. **Tag Matching**: All tags should correspond to option IDs
5. **URLs**: Verify all image and shop links are valid

## Troubleshooting

### Products not showing
- Check that product tags match selected option IDs
- Verify product IDs are unique
- Ensure `products` array is not empty

### Wrong language displaying
- Verify language code is correct (`en`, not `EN` or `english`)
- Check that the selected language block exists
- Ensure all text fields are properly translated

### Images not loading
- Verify image URLs are accessible
- Check CORS settings on image host
- Use HTTPS URLs

### AI recommendations not working
- Verify `gemini.enabled` is `true`
- Check API key is valid and has quota
- Review prompt for clarity and specificity

## Support

For questions or issues:
- Check `docs/MIGRATION-GUIDE.md` for upgrade instructions
- Review `docs/MULTI-LANGUAGE.md` for language implementation
- See `config/example.json` for a complete working example

---

**Last Updated:** 2026-02-15  
**Version:** 2.0.0
