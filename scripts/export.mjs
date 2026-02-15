import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function exportStatic() {
  try {
    const nextDir = path.join(rootDir, '.next');
    const outDir = path.join(rootDir, 'out');

    // Clean out directory
    if (fs.existsSync(outDir)) {
      await fs.remove(outDir);
    }
    await fs.ensureDir(outDir);

    // Copy static files
    const staticDir = path.join(nextDir, 'static');
    if (fs.existsSync(staticDir)) {
      await fs.copy(staticDir, path.join(outDir, '_next/static'));
    }

    // Copy HTML files from server/app
    const serverAppDir = path.join(nextDir, 'server/app');
    if (fs.existsSync(serverAppDir)) {
      // Copy index.html to root
      const indexPath = path.join(serverAppDir, 'index.html');
      if (fs.exists(indexPath)) {
        await fs.copy(indexPath, path.join(outDir, 'index.html'));
      }

      // Copy 404 page
      const notFoundPath = path.join(serverAppDir, '_not-found.html');
      if (fs.existsSync(notFoundPath)) {
        await fs.copy(notFoundPath, path.join(outDir, '404.html'));
      }
    }

    // Copy public folder
    const publicDir = path.join(rootDir, 'public');
    if (fs.existsSync(publicDir)) {
      const publicFiles = await fs.readdir(publicDir);
      for (const file of publicFiles) {
        const srcPath = path.join(publicDir, file);
        const destPath = path.join(outDir, file);
        await fs.copy(srcPath, destPath);
      }
    }

    // Create _headers file for Cloudflare Pages
    const headersContent = `/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
`;
    await fs.writeFile(path.join(outDir, '_headers'), headersContent);

    console.log('✓ Static export completed successfully!');
    console.log(`✓ Files exported to: ${outDir}`);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

exportStatic();
