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

import { describe, expect, test } from 'vitest';

import { StorybookSidebarBuilder } from './storybook';

const BASIC_STORYBOOK_SIDEBAR = {
  v: 5,
  entries: {
    'checkbox--docs': {
      id: 'checkbox--docs',
      title: 'Checkbox',
      name: 'Docs',
      importPath: './src/stories/Checkbox.stories.svelte',
      type: 'docs',
      tags: ['dev', 'test', 'autodocs'],
      storiesImports: [],
    },
    'checkbox--basic': {
      type: 'story',
      id: 'checkbox--basic',
      name: 'Basic',
      title: 'Checkbox',
      importPath: './src/stories/Checkbox.stories.svelte',
      tags: ['dev', 'test', 'autodocs'],
    },
    'checkbox--checked': {
      type: 'story',
      id: 'checkbox--checked',
      name: 'Checked',
      title: 'Checkbox',
      importPath: './src/stories/Checkbox.stories.svelte',
      tags: ['dev', 'test', 'autodocs'],
    },
  },
};

const DEEP_STORYBOOK_SIDEBAR = {
  v: 5,
  entries: {
    'checkbox--docs': {
      id: 'checkbox--docs',
      title: 'Checkbox',
      name: 'Docs',
      importPath: './src/stories/Checkbox.stories.svelte',
      type: 'docs',
      tags: ['dev', 'test', 'autodocs'],
      storiesImports: [],
    },
    'progress-linearprogress--docs': {
      id: 'progress-linearprogress--docs',
      title: 'Progress/LinearProgress',
      name: 'Docs',
      importPath: './src/stories/progress/LinearProgress.stories.svelte',
      type: 'docs',
      tags: ['dev', 'test', 'autodocs'],
      storiesImports: [],
    },
    'progress-linearprogress--basic': {
      type: 'story',
      id: 'progress-linearprogress--basic',
      name: 'Basic',
      title: 'Progress/LinearProgress',
      importPath: './src/stories/progress/LinearProgress.stories.svelte',
      tags: ['dev', 'test', 'autodocs'],
    },
    'progress-spinner--docs': {
      id: 'progress-spinner--docs',
      title: 'Progress/Spinner',
      name: 'Docs',
      importPath: './src/stories/progress/Spinner.stories.svelte',
      type: 'docs',
      tags: ['dev', 'test', 'autodocs'],
      storiesImports: [],
    },
  },
};
describe('StorybookSidebarBuilder', () => {
  test('malformed object should throw an error', () => {
    const builder = new StorybookSidebarBuilder();
    expect(() => {
      builder.fromStorybookIndex(false).build();
    }).toThrowError('malformed storybook object');
  });

  test('missing version in storybook index should throw an error', () => {
    const builder = new StorybookSidebarBuilder();
    expect(() => {
      builder.fromStorybookIndex({}).build();
    }).toThrowError('missing version in storybook index');
  });

  test('incompatible version should an error', () => {
    const builder = new StorybookSidebarBuilder();
    expect(() => {
      builder
        .fromStorybookIndex({
          v: 6,
        })
        .build();
    }).toThrowError('invalid version number for storybook index');
  });

  test('missing entries should an error', () => {
    const builder = new StorybookSidebarBuilder();
    expect(() => {
      builder
        .fromStorybookIndex({
          v: 5,
        })
        .build();
    }).toThrowError('missing entries in storybook index');
  });

  test('no entries should return an empty array', () => {
    const builder = new StorybookSidebarBuilder();
    const result = builder
      .fromStorybookIndex({
        v: 5,
        entries: {},
      })
      .build();
    expect(result).toHaveLength(0);
  });

  test('basic storybook index', () => {
    const builder = new StorybookSidebarBuilder();
    const result = builder.fromStorybookIndex(BASIC_STORYBOOK_SIDEBAR).build();
    expect(result).toStrictEqual([
      {
        collapsed: false,
        collapsible: true,
        items: [
          {
            href: '/storybook?id=checkbox--docs',
            label: 'Docs',
            type: 'link',
          },
          {
            href: '/storybook?id=checkbox--basic',
            label: 'Basic',
            type: 'link',
          },
          {
            href: '/storybook?id=checkbox--checked',
            label: 'Checked',
            type: 'link',
          },
        ],
        label: 'Checkbox',
        type: 'category',
      },
    ]);
  });

  test('multi category storybook index', () => {
    const builder = new StorybookSidebarBuilder();
    const result = builder.fromStorybookIndex(DEEP_STORYBOOK_SIDEBAR).build();
    expect(result).toStrictEqual([
      {
        collapsed: false,
        collapsible: true,
        items: [
          {
            href: '/storybook?id=checkbox--docs',
            label: 'Docs',
            type: 'link',
          },
        ],
        label: 'Checkbox',
        type: 'category',
      },
      {
        collapsed: false,
        collapsible: true,
        items: [
          {
            collapsed: false,
            collapsible: true,
            items: [
              {
                href: '/storybook?id=progress-linearprogress--docs',
                label: 'Docs',
                type: 'link',
              },
              {
                href: '/storybook?id=progress-linearprogress--basic',
                label: 'Basic',
                type: 'link',
              },
            ],
            label: 'LinearProgress',
            type: 'category',
          },
          {
            collapsed: false,
            collapsible: true,
            items: [
              {
                href: '/storybook?id=progress-spinner--docs',
                label: 'Docs',
                type: 'link',
              },
            ],
            label: 'Spinner',
            type: 'category',
          },
        ],
        label: 'Progress',
        type: 'category',
      },
    ]);
  });
});
