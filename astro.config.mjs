import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import db from '@astrojs/db';

// https://astro.build/config
export default defineConfig({
  // Order matters: put db() first
  integrations: [db(), netlify()],
  output: 'server',
  adapter: netlify(),
});
