/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions & import('@trivago/prettier-plugin-sort-imports').PluginConfig} */

const config = {
  printWidth: 80,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  plugins: [
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrder: [
    '^react$',
    '<THIRD_PARTY_MODULES>',
    '^@/components/(.*)$',
    '^@/reusable-fns/(.*)$',
    '^@/routes/(.*)$',
    '^@/(.*)$',
    '^[./]',
  ],
};

export default config;
