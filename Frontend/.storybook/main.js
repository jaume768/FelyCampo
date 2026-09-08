import { fileURLToPath } from 'node:url';

/** @type { import('@storybook/nextjs-vite').StorybookConfig } */
const config = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  "framework": "@storybook/nextjs-vite",
  "staticDirs": [
    "..\\public"
  ],
  async viteFinal(config) {
    // El framework @storybook/nextjs-vite no está leyendo el alias "@/*"
    // de jsconfig.json (solo detecta tsconfig.json), así que cualquier
    // componente que importe con "@/..." (la mayoría de admin/, y varios
    // de ecommerce/layout/ui) rompía con 404 al pedirlo desde el
    // navegador — se declara aquí a mano, igual que "@/*": ["./src/*"]
    // en jsconfig.json.
    config.resolve = {
      ...(config.resolve || {}),
      alias: {
        ...(config.resolve?.alias || {}),
        '@': fileURLToPath(new URL('../src', import.meta.url)),
      },
    };
    config.esbuild = {
      ...(config.esbuild || {}),
      loader: "jsx",
      include: /src\/.*\.js$/,
    };
    config.optimizeDeps = {
      ...(config.optimizeDeps || {}),
      esbuildOptions: {
        ...(config.optimizeDeps?.esbuildOptions || {}),
        loader: { ".js": "jsx" },
      },
    };
    return config;
  },
};
export default config;