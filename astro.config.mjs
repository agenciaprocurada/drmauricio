import { defineConfig } from 'astro/config';

// Single static landing page for Dr. Maurício Araújo's clinical e-book.
export default defineConfig({
  server: { port: 3040, host: true },
  devToolbar: { enabled: false },
});
