/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { PathLike, Stats } from 'node:fs';
import type { FileHandle } from 'node:fs/promises';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import setup from './vitest-generate-api-global-setup.js';

vi.mock(import('node:fs/promises'), () => {
  const stat = vi.fn();
  const readFile = vi.fn();
  const writeFile = vi.fn();
  const mkdir = vi.fn();
  const copyFile = vi.fn();
  return {
    default: { stat, readFile, writeFile, mkdir, copyFile },
    stat,
    readFile,
    writeFile,
    mkdir,
    copyFile,
  };
});

// Minimal TypeScript declaration that exercises namespace + class extraction
const MOCK_EXTENSION_API_CONTENT = `
declare module '@podman-desktop/api' {
  export namespace commands {
    export function registerCommand(command: string): void;
    export function executeCommand<T>(command: string): Promise<T>;
    export const onDidExecuteCommand: string;
  }
  export class EventEmitter<T> {
    fire(data: T): void;
    dispose(): void;
  }
}
`;

// API split in several files
const MOCK_SPLIT_EXTENSION_API_CONTENT = `
/// <reference path="./common/disposable.d.ts" />
/// <reference path="./api/commands.d.ts" />
declare module '@podman-desktop/api' {
  export const version: string;
  export namespace commands {
    export function executeCommand<T>(command: string): Promise<T>;
  }
}
`;
const MOCK_DISPOSABLE_CONTENT = `
declare module '@podman-desktop/api' {
  export class Disposable {
    dispose(): void;
    static from(...disposableLikes: { dispose: () => unknown }[]): Disposable;
  }
}
`;
const MOCK_COMMANDS_CONTENT = `
/// <reference path="../common/disposable.d.ts" />
declare module '@podman-desktop/api' {
  export namespace commands {
    export function registerCommand(command: string): Disposable;
    export function executeCommand<T>(command: string, ...rest: unknown[]): Promise<T>;
  }
}
`;

const MOCK_TEMPLATE =
  '{{#namespaces}}{{name}}:{{#functions}}{{.}},{{/functions}} {{/namespaces}}{{#classes}}{{name}}:{{#methods}}{{.}},{{/methods}} {{/classes}}';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

// path relative to the repository root with forward slashes, whatever the platform and separators used
function toRepoPath(filePath: unknown): string {
  return path.relative(REPO_ROOT, String(filePath)).split(path.sep).join('/');
}

const ENTRY_FILE = 'packages/extension-api/src/extension-api.d.ts';
const DISPOSABLE_FILE = 'packages/extension-api/src/common/disposable.d.ts';
const COMMANDS_FILE = 'packages/extension-api/src/api/commands.d.ts';
const GENERATED_FILE = 'packages/api-mocks-vitest/src/@podman-desktop/api.ts';
const GENERATED_PRODUCT_FILE = 'packages/api-mocks-vitest/src/product.json';

type MockFile = { content?: string; mtimeMs: number };

// files are keyed by their path relative to the repository root
let files: Record<string, MockFile>;

function findFile(filePath: unknown): MockFile | undefined {
  return files[toRepoPath(filePath)];
}

function enoent(filePath: unknown): Error {
  return Object.assign(new Error(`ENOENT: ${String(filePath)}`), { code: 'ENOENT' });
}

function readMockFile(filePath: PathLike | FileHandle): Promise<string> {
  const content = findFile(filePath)?.content;
  if (content === undefined) {
    return Promise.reject(enoent(filePath));
  }
  return Promise.resolve(content);
}

// the generated files are newer (or older) than the inputs, which are all at mtime 100
function generatedFilesAt(mtimeMs: number): void {
  files[GENERATED_FILE] = { mtimeMs };
  files[GENERATED_PRODUCT_FILE] = { mtimeMs };
}

function generatedContent(): string {
  expect(writeFile).toHaveBeenCalledOnce();
  return String(vi.mocked(writeFile).mock.calls[0]?.[1]);
}

beforeEach(() => {
  vi.resetAllMocks();
  files = {
    [ENTRY_FILE]: { content: MOCK_EXTENSION_API_CONTENT, mtimeMs: 100 },
    'packages/api-mocks-vitest/src/api.mustache': { content: MOCK_TEMPLATE, mtimeMs: 100 },
    'product.json': { mtimeMs: 100 },
  };
  vi.mocked(stat).mockImplementation(async filePath => {
    const mtimeMs = findFile(filePath)?.mtimeMs;
    if (mtimeMs === undefined) {
      throw enoent(filePath);
    }
    return { mtimeMs } as Stats;
  });
  vi.mocked(readFile).mockImplementation(readMockFile);
  vi.mocked(mkdir).mockResolvedValue(undefined);
  vi.mocked(copyFile).mockResolvedValue(undefined);
  vi.mocked(writeFile).mockResolvedValue(undefined);
});

describe('setup', () => {
  test('skips generation when output file is newer than all inputs', async () => {
    generatedFilesAt(300);

    await setup();

    expect(writeFile).not.toHaveBeenCalled();
    expect(mkdir).not.toHaveBeenCalled();
  });

  test('generates output when it does not exist yet', async () => {
    await setup();

    expect(mkdir).toHaveBeenCalled();
    expect(copyFile).toHaveBeenCalled();
    const content = generatedContent();
    expect(content).toContain('commands:registerCommand,executeCommand,onDidExecuteCommand,');
    expect(content).toContain('EventEmitter:fire,dispose,');
  });

  test('generates namespaces named like Object members', async () => {
    files[ENTRY_FILE] = {
      content: `
declare module '@podman-desktop/api' {
  export namespace toString {
    export function format(): string;
  }
  export namespace constructor {
    export function create(): void;
  }
}
`,
      mtimeMs: 100,
    };

    await setup();

    const content = generatedContent();
    expect(content).toContain('toString:format,');
    expect(content).toContain('constructor:create,');
  });

  test('regenerates output when it is older than the newest input', async () => {
    files[ENTRY_FILE] = { content: MOCK_EXTENSION_API_CONTENT, mtimeMs: 500 };
    generatedFilesAt(200);

    await setup();

    expect(mkdir).toHaveBeenCalled();
    expect(copyFile).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
  });

  describe('API split in several files', () => {
    beforeEach(() => {
      files[ENTRY_FILE] = { content: MOCK_SPLIT_EXTENSION_API_CONTENT, mtimeMs: 100 };
      files[DISPOSABLE_FILE] = { content: MOCK_DISPOSABLE_CONTENT, mtimeMs: 100 };
      files[COMMANDS_FILE] = { content: MOCK_COMMANDS_CONTENT, mtimeMs: 100 };
    });

    test('includes declarations from files referenced by the entry file', async () => {
      await setup();

      expect(generatedContent()).toContain('Disposable:dispose,from,');
    });

    test('merges a namespace declared in several files without duplicates', async () => {
      await setup();

      expect(generatedContent()).toContain('commands:registerCommand,executeCommand, ');
    });

    test('reads a file referenced several times only once', async () => {
      await setup();

      const disposableReads = vi
        .mocked(readFile)
        .mock.calls.filter(([filePath]) => toRepoPath(filePath) === DISPOSABLE_FILE);
      expect(disposableReads).toHaveLength(1);
    });

    test('regenerates output when a referenced file is newer than the output', async () => {
      files[DISPOSABLE_FILE] = { content: MOCK_DISPOSABLE_CONTENT, mtimeMs: 500 };
      generatedFilesAt(200);

      await setup();

      expect(generatedContent()).toContain('Disposable:dispose,from,');
    });

    test('skips generation when output file is newer than every referenced file', async () => {
      generatedFilesAt(300);

      await setup();

      expect(writeFile).not.toHaveBeenCalled();
    });

    test('rejects when a referenced file does not exist', async () => {
      delete files[COMMANDS_FILE];

      await expect(setup()).rejects.toThrow('ENOENT');

      expect(writeFile).not.toHaveBeenCalled();
    });
  });
});
