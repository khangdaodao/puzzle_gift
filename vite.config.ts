import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset paths relative, so the build works on Vercel, Netlify,
// and GitHub Pages (project sites served from a sub-path) without changes.
export default defineConfig({ base: './', plugins: [react()] });
