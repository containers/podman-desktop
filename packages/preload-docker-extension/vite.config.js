/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

 import {chrome} from '../../.electron-vendors.cache.json';
 import {join} from 'path';
 import {builtinModules} from 'module';
 import { coverageConfig } from '../../vitest-shared-extensions.config';

 const PACKAGE_ROOT = __dirname;
 const PACKAGE_NAME = 'preload-docker-extension';
 
 /**
  * @type {import('vite').UserConfig}
  * @see https://vitejs.dev/config/
  */
 const config = {
   mode: process.env.MODE,
   root: PACKAGE_ROOT,
   envDir: process.cwd(),
   resolve: {
     alias: {
       '/@/': join(PACKAGE_ROOT, 'src') + '/',
     },
   },
   /*plugins: [
     commonjs({
       dynamicRequireTargets: [
         // include using a glob pattern (either a string or an array of strings)
         'node_modules/ssh2/lib/protocol/crypto/poly1305.js',
       ]
       }),
   ],*/
   build: {
     sourcemap: 'inline',
     target: `chrome${chrome}`,
     outDir: 'dist',
     assetsDir: '.',
     minify: process.env.MODE !== 'development',
     lib: {
       entry: 'src/index.ts',
       formats: ['cjs'],
     },
     rollupOptions: {
       external: [
         'electron',
         ...builtinModules.flatMap(p => [p, `node:${p}`]),
       ],
       output: {
         entryFileNames: '[name].cjs',
       },
     },
     emptyOutDir: true,
     reportCompressedSize: false,
   },
   test: {
    ...coverageConfig(PACKAGE_ROOT, PACKAGE_NAME),
  },
 };
 
 export default config;
 