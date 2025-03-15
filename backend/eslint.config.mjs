import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginPrettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';
import pluginJest from 'eslint-plugin-jest';

export default [
  { files: ['**/*.{js,mjs,cjs}'] },
  { languageOptions: { globals: { ...globals.node, ...globals.jest } } },
  pluginJs.configs.recommended,
  {
    plugins: {
      prettier: pluginPrettier,
      jest: pluginJest,
    },
    rules: {
      ...pluginPrettier.configs.recommended.rules,
      'prettier/prettier': ['error'],
    },
  },
  configPrettier,
];
