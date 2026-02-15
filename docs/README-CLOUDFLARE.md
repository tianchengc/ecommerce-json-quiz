# Tea Quiz Widget - Next.js + Cloudflare Pages

A lightweight, embeddable tea quiz widget built with Next.js and TailwindCSS, optimized for deployment on Cloudflare Pages.

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your quiz in action.

### Building for Production

```bash
# Build the project
npm run build

# Test the production build locally
npm start
```

## ☁️ Deploying to Cloudflare Pages

### Method 1: Using Wrangler CLI (Recommended)

1. **Install Wrangler** (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Deploy to Cloudflare Pages**:
   ```bash
   npm run pages:deploy
   ```

### Method 2: Using Cloudflare Dashboard

1. **Build your project**:
   ```bash
   npm run build
   ```

2. **Go to Cloudflare Dashboard**:
   - Navigate to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to "Pages" section
   - Click "Create a project"

3. **Connect your Git repository** or **Upload directly**:
   - If using Git: Connect your GitHub/GitLab repository
   - If uploading: Upload the `out` folder

4. **Configure build settings**:
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Environment variables**: Add variables from `.env.example`

5. **Set Environment Variables** in Cloudflare Pages:
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_QUIZ_CONFIG_PATH`
   - `NEXT_PUBLIC_EMAIL_ENABLED`
   - `RESEND_API_KEY` (if using email features)

### Method 3: Using GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: tea-quiz-widget
          directory: out
```

## 📝 Configuration

### Quiz Configuration

Edit `config/quiz.json` to customize your quiz:

```json
{
  "configuration": {
    "general": {
      "showFakeLoading": true
    },
    "welcomePage": {
      "title": "Find Your Perfect Tea",
      "description": "Take our personalized quiz...",
      ...
    },
    "resultPage": {
      "showPrice": false,
      ...
    }
  },
  "questions": [...],
  "results": [...]
}
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:
- `NEXT_PUBLIC_APP_NAME`: Your app name
- `NEXT_PUBLIC_APP_URL`: Your production URL
- `NEXT_PUBLIC_QUIZ_CONFIG_PATH`: Path to quiz config (default: `/config/quiz.json`)
- `RESEND_API_KEY`: API key for Resend email service (optional)

## 🏗️ Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main quiz page
│   └── globals.css         # Global styles
├── components/
│   ├── Welcome.tsx         # Welcome screen
│   ├── QuestionCard.tsx    # Question display
│   ├── Results.tsx         # Results display
│   └── UI.tsx              # UI components
├── lib/
│   └── quizLogic.ts        # Quiz logic and types
├── config/
│   └── quiz.json           # Quiz configuration
├── public/
│   └── config/
│       └── quiz.json       # Public quiz config
├── .env                    # Environment variables
├── .env.example            # Environment variables template
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Dependencies
```

## 🔧 Customization

### Styling

Edit `app/globals.css` and `tailwind.config.ts` to customize colors and styles.

### Quiz Logic

Modify `lib/quizLogic.ts` to adjust matching algorithms and scoring.

### Components

Components are in the `components/` directory - all use React with TypeScript.

## 📦 Dependencies

- **Next.js 14**: React framework with static export
- **React 18**: UI library
- **Tailwind CSS 3**: Utility-first CSS framework
- **TypeScript 5**: Type-safe JavaScript

## 🔒 Security

- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Sensitive keys (like `RESEND_API_KEY`) should NOT have the `NEXT_PUBLIC_` prefix
- Never commit `.env` file to version control

## 🐛 Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Config Not Loading

Ensure `public/config/quiz.json` exists and is valid JSON:

```bash
# Validate JSON
cat public/config/quiz.json | jq
```

## 📄 License

MIT License - see LICENSE file for details.

## 👥 Author

Tiancheng Chen

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
