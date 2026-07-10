import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

export default [
  { files: ['**/*.{js,jsx}'] },
  { languageOptions: { ecmaVersion: 2024, sourceType: 'module', globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReactHooks.configs.flat['recommended-latest'],
  {
    rules: {
      'react/prop-types': 'off',
    },
  },
];
