import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";

export default [
  // Додаємо рекомендовані налаштування для TS
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,

  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: eslintPluginAstro.parser,
      parserOptions: {
        // Оце критично важливий момент:
        // Ми кажемо Astro-парсеру використовувати TS-парсер для скриптів всередині
        parser: tsParser,
        extraFileExtensions: [".astro"],
        sourceType: "module",
      },
    },
  },
  {
    rules: {
      // Ваші кастомні правила
    },
  },
];
