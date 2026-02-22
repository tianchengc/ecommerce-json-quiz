# 🍵 Ecommerce Quiz Widget

A lightweight, embeddable quiz component built with **Next.js 15**, **React**, and **TailwindCSS**. Designed to be embedded into platforms like **Wix**, **Shopify**, and **WordPress** using an `<iframe>`. The quiz features **Gemini AI** for personalized recommendations and a robust multi-language configuration system.

## 🚀 Quick Start

### Local Development

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd ecommerce-json-quiz

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 4. Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your quiz in action.

---

## ✨ Features

- 🤖 **Gemini AI Integration**: Intelligent, personalized product recommendations powered by Google's Gemini Pro.
- 🌍 **Multi-Language Support**: Complete internationalization support (i18n) via a structured `example.json`.
- 🧠 **Smart Logic System**: Supports complex **AND**, **OR**, and **NOT** logic between answers for tag-based matching.
- 🎯 **Optimized for Embedding**: Perfectly sized for Wix, Shopify, or any platform via iframe.
- 📱 **Mobile-First Design**: Fully responsive and optimized for touch devices.
- ⚡ **Next.js 15 + App Router**: High-performance architecture with Server Components and API routes.
- ☁️ **Cloudflare Ready**: Native support for Cloudflare Pages via OpenNext.

---

## 📦 Project Structure

```
├── app/                    # Next.js App Router (pages & API)
│   ├── [locale]/           # i18n routing
│   │   ├── quiz/           # Main quiz interface
│   │   └── results/        # Recommendation results
│   └── api/                # Backend endpoints (Gemini, Recommendations)
├── components/            # Reusable UI components (QuizForm, UI, etc.)
├── docs/                  # Detailed documentation
├── lib/                   # Shared logic, schemas, and AI integration
├── public/
│   └── config/
│       └── example.json   # Sample configuration reference
├── wrangler.jsonc         # Cloudflare Pages configuration
├── next.config.mjs        # Next.js configuration
└── package.json           # Project dependencies & scripts
```

---

## 🛠️ Configuration

The quiz is entirely driven by `public/config/example.json`. This file supports multiple languages:

```json
{
  "en": {
    "configuration": {
      "gemini": {
        "enabled": true,
        "model": "gemini-1.5-flash"
      }
    },
    "questions": [ ... ],
    "products": [ ... ]
  },
  "fr": { ... }
}
```

Detailed configuration options can be found in [docs/CONFIG-FILE-REFERENCE.md](docs/CONFIG-FILE-REFERENCE.md).

---

## 🤖 Gemini AI Integration

To enable AI-powered recommendations:

1. Obtain a Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Add it to your `.env` file: `GEMINI_API_KEY=your_key_here`.
3. Enable Gemini in the locale block of your `example.json`.

See [docs/GEMINI-INTEGRATION.md](docs/GEMINI-INTEGRATION.md) for more details.

---

## ⚙️ Cloudflare Worker Setup

This project uses `@opennextjs/cloudflare` to run Next.js inside a Cloudflare Worker.

### 1. Initialize Cloudflare Resources

Before your first deployment, ensure you have the required R2 bucket for caching and are logged in:

```bash
# Login to Cloudflare
npx wrangler login

# Create the cache bucket (required by OpenNext)
npx wrangler r2 bucket create ecommerce-json-quiz-cache
```

### 2. Environment Configuration

Add your **GEMINI_API_KEY** to your Cloudflare project either through the dashboard or via wrangler:

```bash
npx wrangler secret put GEMINI_API_KEY
```

---

## ☁️ Deployment

The recommended way to deploy this widget is via **Cloudflare Workers**.

### Local Deployment Validation

Before deploying, you can validate the Cloudflare-specific build locally:

```bash
# 1. Build using OpenNext-Cloudflare
npm run pages:build

# 2. Preview the build locally (using Wrangler)
npm run pages:dev
```

For more deployment options (GitHub Actions, Dashboard), see [docs/README-CLOUDFLARE.md](docs/README-CLOUDFLARE.md).

---

## 🚀 Deploying as a Cloudflare Worker

To deploy this project as a Cloudflare Worker:

1. **Create a new Worker in the Cloudflare dashboard**
   - Choose "Create Application" > "Workers" (recommended: Workers for full SSR support)
   - Connect your GitHub repository or upload your code
   - Add build and deploy command as following
   
```bash
npx @opennextjs/cloudflare build
npx @opennextjs/cloudflare deploy
```

2. **Set environment variables**
   - Add `DEFAULT_CONFIG_FILE=example.json` (or your config file name)
   - Add your `GEMINI_API_KEY` (see above)

---

## 🔌 Using as a Widget (Iframe)

Once deployed, you can embed the quiz anywhere:

```html
<iframe 
  src="https://your-quiz-app.pages.dev/en/quiz"
  width="100%" 
  height="700" 
  style="border: none; border-radius: 12px; overflow: hidden;"
  loading="lazy">
</iframe>
```

---

## 📄 License

MIT — open for community use and extension.

---

## ✍️ Author

Created by [Tiancheng Chen / @tianchengc](https://github.com/tianchengc)

**Main Features:**
- ✅ Next.js 15 & AI Integration
- ✅ Multi-language JSON config
- ✅ Responsive Quiz UI
- ✅ Gemini-powered personal recommendation
- ✅ Cloudflare Pages optimized
- ✅ Configurable quiz data via JSON


