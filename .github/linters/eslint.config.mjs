// .github/linters/eslint.config.mjs
import globals from "globals";

export default [
  // All browser JS files
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // Mocha tests
  {
    files: ["test/**/*.js", "**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
  },

  // If you have any pure Node scripts elsewhere, you can add another block here
];
