# 🍵 Embedded Quiz Widget

A lightweight, embeddable quiz component built with **React** and **TailwindCSS**. Designed to be embedded into platforms like **Wix**, **Shopify**, and **WordPress** using an `<iframe>`. The quiz loads questions, logic, and product recommendations from a static `quiz.json` configuration file.

---

## ✨ Features

- ✅ Static quiz loaded from `quiz.json`
- 🧠 Supports **AND**, **OR**, and **NOT** logic between answers
- 🛒 Displays product recommendations based on result mappings
- 🎯 Optimized for embedding in Wix or any website via iframe
- 📱 Fully responsive and mobile-first design
- ⚡ Fast loading with smooth animations and transitions
- 🔄 Progress tracking and question navigation
- 🌍 Multi-language support ready (coming soon)

---

## 📦 Project Structure

```
├── public/
│   └── quiz.json               # Quiz configuration and product data
├── src/
│   ├── App.tsx                 # Main quiz application component
│   ├── components/             # Reusable UI components
│   │   ├── UI.tsx              # Base UI components (Button, Card, etc.)
│   │   ├── Welcome.tsx         # Welcome screen component
│   │   ├── QuestionCard.tsx    # Quiz question display component
│   │   └── Results.tsx         # Results and recommendations component
│   ├── utils/                  # Logic and utilities
│   │   └── quizLogic.ts        # Quiz condition evaluation logic
│   ├── index.css               # TailwindCSS styles and custom components
│   └── main.tsx                # React app entry point
├── tailwind.config.js          # TailwindCSS configuration with custom theme
├── postcss.config.js           # PostCSS configuration
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript project references
├── tsconfig.app.json           # TypeScript config for app code
├── tsconfig.node.json          # TypeScript config for build tools
└── package.json                # Project dependencies
```

---

## 🧠 Quiz Logic System

The quiz uses a flexible condition system that supports:

- **anyOf**: At least one of the specified options must be selected
- **allOf**: All specified options must be selected  
- **not**: None of the specified options must be selected

### `quiz.json` Format

```json
{
  "questions": [
    {
      "id": "q1",
      "text": "What kind of flavors do you enjoy?",
      "type": "multi-select",
      "options": [
        { "id": "floral", "text": "Floral (jasmine, rose, lavender)" },
        { "id": "fruity", "text": "Fruity (citrus, berry, tropical)" },
        { "id": "earthy", "text": "Earthy (mineral, woody, mossy)" }
      ]
    },
    {
      "id": "q2",
      "text": "What's your goal for drinking tea?",
      "type": "single-select",
      "options": [
        { "id": "relax", "text": "Relaxation and stress relief" },
        { "id": "energy", "text": "Energy boost and alertness" }
      ]
    }
  ],
  "results": [
    {
      "productId": "oolong001",
      "productName": "Golden Oolong",
      "productImage": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop",
      "productDescription": "A perfectly balanced oolong with floral notes and a smooth finish.",
      "price": "$24.99",
      "shopLink": "#",
      "conditions": {
        "anyOf": ["floral", "fruity"],
        "allOf": ["relax"],
        "not": ["earthy"]
      }
    }
  ]
}
```

---

## 🚀 Setup & Run

### Prerequisites

- Node.js 18+ (required for Vite 7.x)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎨 Customization

### Theming

The project includes a custom TailwindCSS theme with tea-inspired colors:

- **Primary colors**: Blue gradient (`primary-50` to `primary-900`)
- **Tea colors**: Warm brown gradient (`tea-50` to `tea-900`)
- **Custom animations**: `fade-in`, `slide-up`, `pulse-slow`

### Quiz Configuration

Edit `public/quiz.json` to customize:

- Questions and answer options
- Product recommendations
- Matching logic conditions
- Product images and descriptions

---

## 🔌 Embed in Wix / Shopify / WordPress

After deploying (e.g., to Vercel, Netlify, or your own server), embed the quiz with:

```html
<iframe 
  src="https://your-domain.com"
  width="100%" 
  height="600" 
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" 
  loading="lazy">
</iframe>
```

### Integration Tips

- **Responsive**: Use `width="100%"` and adjust height as needed
- **Mobile-first**: The quiz is optimized for mobile devices
- **Performance**: Lazy loading is built-in for better performance
- **Accessibility**: Proper ARIA labels and keyboard navigation

> ✅ **Tip**: Use `postMessage` API for dynamic resizing or communication between iframe and host page (optional).

---

## 🛠️ Technical Details

### Built With

- **React 19**: Latest React with TypeScript support
- **Vite 7.x**: Fast build tool and dev server
- **TailwindCSS 4.x**: Utility-first CSS framework
- **TypeScript**: Full type safety with project references

### Key Features

- **Mobile-first responsive design**
- **Smooth animations and transitions**
- **Progress tracking with visual indicators**
- **Flexible quiz logic system**
- **Beautiful product recommendation cards**
- **TypeScript for type safety**
- **Modern build tools and hot reloading**

---

## 📚 Coming Soon

- AI-assisted quiz generation
- Custom product description generation with OpenAI
- Admin dashboard to edit quizzes
- Result export & webhook support
- Multi-language support
- A/B testing for questions and results
- Analytics and conversion tracking

---

## 📄 License

MIT — open for community use and extension. Attribution encouraged.

---

## ✍️ Author

Created by [Tiancheng Chen / @tianchengc](https://github.com/tianchengc)

**Features Implemented:**
- ✅ Complete React + TypeScript project structure
- ✅ TailwindCSS styling with custom theme
- ✅ Quiz logic engine with AND/OR/NOT conditions
- ✅ Responsive design with mobile-first approach
- ✅ Loading states and smooth animations
- ✅ Progress tracking and navigation
- ✅ Product recommendation system
- ✅ Configurable quiz data via JSON
- ✅ Optimized for iframe embedding

Need help or want to collaborate? Reach out!
