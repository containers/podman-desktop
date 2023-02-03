/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

module.exports = {
  content: [
    'packages/renderer/index.html',
    'packages/renderer/src/**/*.{svelte,css}',
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: 'width',
      },
      colors: {
        'charcoal': {
           50: '#767676',
          100: '#707073',
          200: '#5c5c5c',
          300: '#464649',
          400: '#4a4b4f',
          500: '#36363d',
          600: '#27272a',
          700: '#222222',
          800: '#18181b',
          900: '#0f0f11',
        },
        'dustypurple': {
           50: '#f2f2fb',
          100: '#e7e8f8',
          200: '#d3d3f2',
          300: '#b9b8e9',
          400: '#a09adf',
          500: '#8f81d3',
          600: '#8772c7',
          700: '#6d57ab',
          800: '#59498a',
          900: '#4a406f',
        },
        'fuschia': {
           50: '#fdf2ff',
          100: '#f9e3ff',
          200: '#f4c6ff',
          300: '#f099ff',
          400: '#e85dff',
          500: '#d721ff',
          600: '#c200ff',
          700: '#a200cf',
          800: '#8600a9',
          900: '#710689',
        },
        'sky': {
           50: '#f2f8fd',
          100: '#e5eff9',
          200: '#c4def3',
          300: '#90c3e9',
          400: '#51a2da',
          500: '#2f88c8',
          600: '#206ca9',
          700: '#1b5789',
          800: '#1a4a72',
          900: '#1b3f5f',
        },
        'green': {
           50: '#f0f9f0',
          100: '#ddefdc',
          200: '#bbdfbb',
          300: '#8ec792',
          400: '#64ad6c',
          500: '#3c8d47',
          600: '#2b7037',
          700: '#225a2d',
          800: '#1d4825',
          900: '#193b20',
        },
        'red': {
           50: '#fff4f1',
          100: '#ffe7e1',
          200: '#ffd1c7',
          300: '#ffb3a1',
          400: '#ff866a',
          500: '#f86847',
          600: '#e5421d',
          700: '#c13414',
          800: '#9f2f15',
          900: '#842c18',
        }
      }
    }
  },
  plugins: [],
};
