/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import globals from 'globals';
import js from '@eslint/js';
import typescriptLint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import svelteParser from 'svelte-eslint-parser';
import importPlugin from 'eslint-plugin-import';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { FlatCompat } from '@eslint/eslintrc';
import unicorn from 'eslint-plugin-unicorn';
import noNull from 'eslint-plugin-no-null';
import sonarjs from 'eslint-plugin-sonarjs';
import etc from 'eslint-plugin-etc';
import svelte from 'eslint-plugin-svelte';
import redundantUndefined from 'eslint-plugin-redundant-undefined';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import fileProgress from 'eslint-plugin-file-progress';
import vitest from '@vitest/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const TYPESCRIPT_PROJECTS = [
  'packages/*/tsconfig.json',
  './website/tsconfig.json',
  './website-argos/tsconfig.json',
  './extensions/*/tsconfig.json',
  './extensions/*/packages/*/tsconfig.json',
  './tests/playwright/tsconfig.json',
  './tools/tsconfig.json',
  './storybook/tsconfig.json',
];

export default [
  {
    ignores: [
      '**/exposedIn*.d.ts',
      '*.config.*js',
      '**/*.config.*js',
      '**/*.tests.setup.*js',
      '**/dist/**/*',
      '**/test-resources',
      '**/__mocks__/',
      '**/coverage/',
      '**/.svelte-kit/',
      '**/.storybook/',
      '**/storybook/storybook-static/',
      '**/.docusaurus/',
      '**/website/api/',
      '**/website/**/*.js',
      'extensions/*.ts',
      'website/build',
      'scripts/**',
      'extensions/*/builtin/**/*',
      'extensions/*/scripts/**/*',
      'extensions/*/packages/*/scripts/**/*',
      'extensions/*/packages/*/builtin/**/*',
      'website/storybook.ts',
      'website/src/pages/storybook/sidebar.cjs',
    ],
  },
  js.configs.recommended,
  ...typescriptLint.configs.recommended,
  sonarjs.configs.recommended,
  ...svelte.configs['flat/recommended'],
  ...fixupConfigRules(
    compat.extends('plugin:import/recommended', 'plugin:import/typescript', 'plugin:etc/recommended'),
  ),
  {
    plugins: {
      // compliant v9 plug-ins
      unicorn,
      'file-progress': fileProgress,
      // non-compliant v9 plug-ins
      etc: fixupPluginRules(etc),
      import: fixupPluginRules(importPlugin),
      'no-null': fixupPluginRules(noNull),
      'redundant-undefined': fixupPluginRules(redundantUndefined),
      'simple-import-sort': fixupPluginRules(simpleImportSort),
      vitest,
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,

        'eslint-import-resolver-custom-alias': {
          alias: {
            '/@': './src',
            '/@gen': './src-generated',
          },

          extensions: ['.ts'],
          packages: ['packages/*', 'extensions/*'],
        },
      },
      'file-progress/activate': {
        progress: {
          hide: false,
          successMessage: 'Lint done...',
        },
      },
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
      // parser: tsParser,
      sourceType: 'module',
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        warnOnUnsupportedTypeScriptVersion: false,
        project: TYPESCRIPT_PROJECTS,
      },
    },
  },
  {
    rules: {
      'vitest/no-import-node-test': 'error',
      'vitest/no-identical-title': 'error',
      eqeqeq: 'error',
      'prefer-promise-reject-errors': 'error',
      semi: ['error', 'always'],
      'comma-dangle': ['warn', 'always-multiline'],

      quotes: [
        'error',
        'single',
        {
          allowTemplateLiterals: true,
        },
      ],

      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: false }],
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          ignoreConditionalTests: true,
        },
      ],
      '@typescript-eslint/no-require-imports': 'off',

      'file-progress/activate': 'warn',

      // disabled import/namespace rule as the plug-in is not fully compatible using the compat mode
      'import/namespace': 'off',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-extraneous-dependencies': 'error',

      // unicorn custom rules
      'unicorn/prefer-node-protocol': 'error',

      // sonarjs custom rules
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-empty-collection': 'off',
      'sonarjs/no-small-switch': 'off',
      // redundant with @typescript-eslint/no-unused-vars
      'sonarjs/no-ignored-exceptions': 'off',
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/todo-tag': 'off',
      'sonarjs/sonar-max-params': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/no-empty-function': 'off',
      'sonarjs/no-base-to-string': 'off',
      'sonarjs/unnecessary-character-escapes': 'off',
      'sonarjs/different-types-comparison': 'off',
      'sonarjs/new-cap': 'off',
      'sonarjs/no-invariant-returns': 'off',
      'sonarjs/updated-loop-counter': 'off',
      'sonarjs/no-redundant-type-constituents': 'off',
      'sonarjs/function-return-type': 'off',
      'sonarjs/no-lonely-if': 'off',
      'sonarjs/deprecation': 'off',
      'sonarjs/use-type-alias': 'off',
      // already enabled by eslint
      'sonarjs/no-async-constructor': 'off',
      // already enabled by typescript
      'sonarjs/no-misused-promises': 'off',
      'sonarjs/no-redeclare': 'off',
      'sonarjs/no-dead-store': 'off',

      // consuming too much time
      'sonarjs/aws-restricted-ip-admin-access': 'off',
      'sonarjs/arguments-order': 'off',
      'sonarjs/no-redundant-assignments': 'off',

      // failing with the AST parser
      'sonarjs/sonar-no-fallthrough': 'off',
      'sonarjs/prefer-enum-initializers': 'off',

      // etc custom rules
      'etc/no-deprecated': 'off',
      // disable this rule as it's not compliant with eslint v9
      'etc/no-commented-out-code': 'off',
      'sonarjs/no-unused-expressions': 'off',

      // disable as it's consuming too much time
      'etc/no-internal': 'off',

      // redundant-undefined custom rules
      'redundant-undefined/redundant-undefined': 'error',

      // simple-import-sort custom rules
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  {
    files: ['**/*.svelte'],

    languageOptions: {
      parser: svelteParser,
      ecmaVersion: 5,
      sourceType: 'script',
      parserOptions: {
        parser: tsParser,
      },
    },

    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'sonarjs/no-nested-assignment': 'off',
      'sonarjs/no-alphabetical-sort': 'off',
    },
  },

  {
    files: ['packages/ui/**'],
    languageOptions: {
      globals: {
        ...Object.fromEntries(Object.entries(globals.node).map(([key]) => [key, 'off'])),
        ...globals.browser,
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@podman-desktop/ui-svelte*'],
              message: 'Please use relative imports as the code is part of @podman-desktop/ui',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['packages/renderer/**'],
    languageOptions: {
      globals: {
        ...Object.fromEntries(Object.entries(globals.node).map(([key]) => [key, 'off'])),
        ...globals.browser,
      },
    },

    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      'no-undef': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-self-assign': 'off',
      'sonarjs/no-empty-function': 'off',
      'sonarjs/sonar-prefer-regexp-exec': 'off',
      'sonarjs/no-dead-store': 'off',
      'sonarjs/sonar-no-regex-spaces': 'off',
      'sonarjs/no-redundant-assignments': 'off',
      'sonarjs/function-return-type': 'off',
      'sonarjs/argument-type': 'off',
      'sonarjs/slow-regex': 'off',

      // reactive statements are not expressions
      'sonarjs/no-unused-expressions': 'off',
    },
  },

  {
    files: ['storybook/**'],
    languageOptions: {
      globals: {
        ...Object.fromEntries(Object.entries(globals.node).map(([key]) => [key, 'off'])),
        ...globals.browser,
      },
    },
  },
  {
    files: ['**/*.spec.ts'],

    rules: {
      'sonarjs/no-hardcoded-ip': 'off',
      'sonarjs/no-clear-text-protocols': 'off',
      'sonarjs/slow-regex': 'off',
      'sonarjs/publicly-writable-directories': 'off',
    },
  },

  {
    files: ['website/**'],
    rules: {
      'sonarjs/no-unknown-property': 'off',
      'sonarjs/media-has-caption': 'off',
    },
  },
];
