import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
// import db from '@astrojs/db'; // Comment this out

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  integrations: [
    // db() // Comment this out
  ],
});