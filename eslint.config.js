const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");

module.exports = [
  {
    ignores: ["dist/"]
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 13,
        sourceType: "module"
      },
      globals: {
        browser: true,
        es2021: true,
        node: true
      }
    },
    plugins: {
      "@typescript-eslint": typescriptEslint
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/no-explicit-any": ["warn"],
      "@typescript-eslint/no-require-imports": ["error", { allowAsImport: true }],
      "indent": ["error", 2],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "double"],
      "semi": ["error", "always"]
    }
  }
];
