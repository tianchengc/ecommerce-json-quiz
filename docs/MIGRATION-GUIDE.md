# Tea Quiz Widget - Next.js + Cloudflare Pages

This project has been successfully migrated from React/Vite to Next.js with TypeScript, optimized for deployment on Cloudflare Pages.

## 🚀 What Changed

### Architecture Migration
- **From**: React + Vite
- **To**: Next.js 14 with App Router + TypeScript
- **Deployment**: Cloudflare Pages (was Docker/nginx)
- **Build System**: Custom static export script

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main quiz page (client component)
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Welcome.tsx
│   ├── QuestionCard.tsx
│   ├── Results.tsx
│   └── UI.tsx
├── lib/                   # Utilities and logic
│   └── quizLogic.ts       # Quiz matching algorithm
├── config/                # Quiz configuration
│   └── quiz.json          # Quiz data and settings
├── public/                # Static assets
│   └── config/            # Public quiz config
├── scripts/               # Build scripts
│   └── export.mjs         # Static export script
├── .env                   # Environment variables (local)
├── .env.example           # Environment template
└── next.config.cjs        # Next.js configuration
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 📦 Building

```bash
# Build for production
npm run build

# Output will be in the `out/` directory
```

The build process:
1. Runs `next build` to compile the Next.js app
2. Executes custom export script that:
   - Copies static files from `.next/static/` to `out/_next/static/`
   - Exports HTML files from `.next/server/app/` to `out/`
   - Copies public assets to `out/`
   - Creates `_headers` file for Cloudflare Pages

## ☁️ Deployment to Cloudflare Pages

### Quick Deploy
```bash
# Deploy to Cloudflare Pages
npm run pages:deploy
```

### Manual Setup

1. **Connect Repository** (Recommended)
   - Push code to GitHub/GitLab
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to Pages → Create a project
   - Connect your repository

2. **Configure Build Settings**
   - **Framework preset**: None (or Next.js - Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node version**: 18 or higher

3. **Environment Variables**
   Add these in Cloudflare Pages settings:
   ```
   NEXT_PUBLIC_APP_NAME=Tea Quiz Widget
   NEXT_PUBLIC_APP_URL=https://your-domain.pages.dev
   NEXT_PUBLIC_QUIZ_CONFIG_PATH=/config/quiz.json
   NEXT_PUBLIC_EMAIL_ENABLED=false
   RESEND_API_KEY=your_key_here (if using email)
   ```

### Direct Upload
```bash
# Build locally
npm run build

# Deploy using Wrangler
wrangler pages deploy out
```

## 🎨 Customization

### Quiz Configuration
Edit `config/quiz.json` to customize:
- Welcome page content
- Questions and options
- Product results and matching logic
- Display settings

### Styling
- Global styles: `app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Component styles: Use Tailwind utility classes

### Environment Variables

**Public variables** (NEXT_PUBLIC_* - available in browser):
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_URL`: Production URL
- `NEXT_PUBLIC_QUIZ_CONFIG_PATH`: Quiz config file path
- `NEXT_PUBLIC_EMAIL_ENABLED`: Enable email features

**Server variables** (only available server-side):
- `RESEND_API_KEY`: Resend email API key

## 📝 Features

- ✅ **Static Export**: Fully static site, no server required
- ✅ **TypeScript**: Type-safe code
- ✅ **Tailwind CSS**: Utility-first styling
- ✅ **Responsive**: Mobile-first design
- ✅ **Fast**: Optimized for Cloudflare's global CDN
- ✅ **Configurable**: JSON-based quiz configuration
- ✅ **Client-Side**: All quiz logic runs in browser

## 🔍 Testing

### Local Testing
```bash
# Development server
npm run dev

# Production build test
npm run build
npx serve out
```

### Verify Build
```bash
# Check build output
ls -la out/

# Verify critical files exist
test -f out/index.html && echo "✓ index.html exists"
test -f out/404.html && echo "✓ 404.html exists"
test -d out/_next/static && echo "✓ Static assets exist"
test -d out/config && echo "✓ Config folder exists"
```

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next out node_modules
npm install
npm run build
```

### Config Not Loading
Ensure `public/config/quiz.json` is valid JSON:
```bash
cat public/config/quiz.json | npx json
```

### Static Assets Missing
The custom export script copies files from `.next` to `out`. If assets are missing:
1. Check `scripts/export.mjs`
2. Verify `.next/static/` has the files
3. Run build again

## 🚀 Performance

- **First Load JS**: ~91.6 kB (gzipped)
- **Static Generation**: All pages pre-rendered
- **CDN**: Served from Cloudflare's edge network
- **Caching**: Aggressive caching with `_headers` file

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🔐 Security

- No server-side code
- Environment variables properly scoped
- Content Security headers via `_headers` file
- HTTPS enforced by Cloudflare

## 📄 License

MIT - see LICENSE file

## 👤 Author

Tiancheng Chen

---

For the original deployment guide, see [README-CLOUDFLARE.md](./README-CLOUDFLARE.md)
