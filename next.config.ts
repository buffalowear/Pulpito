import type { NextConfig } from 'next';

// O Púlpito é um site estático (sem servidor próprio): pode ser publicado em
// qualquer hospedagem de arquivos, como GitHub Pages, Netlify ou Vercel.
// NEXT_PUBLIC_BASE_PATH = subpasta onde o site fica (ex.: "/pulpito"); vazio se ficar na raiz.
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: base || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: { '*.css': { loaders: ['@tailwindcss/turbopack'], as: '*.css' } },
  },
};

export default nextConfig;
