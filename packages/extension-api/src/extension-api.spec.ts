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

import assert from 'node:assert';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

import typescript from 'typescript';
import { describe, expect, test } from 'vitest';

// Guardrails for the extension API split in several files (#19127).
//
// extension-api.d.ts keeps the license, the @module comment and version/apiVersion, and references with
// `/// <reference path="..." />` the files under common/ (types shared by several namespaces) and api/ (one file
// per namespace), in sorted order. Each of these files:
// - wraps its declarations in exactly one `declare module '@podman-desktop/api' { ... }` block. TypeScript merges
//   the blocks, so a file can use Disposable, Event<T>, Uri, etc. without any import
// - has no top-level import or export, which would turn the block into a module augmentation
// - has the license header as a plain block comment, see LICENSE_HEADER below
// Declarations moved from extension-api.d.ts are moved verbatim: no reformatting, renaming or doc edits.

const MODULE_NAME = '@podman-desktop/api';
const SRC_DIR = __dirname;
const ENTRY_FILE = join(SRC_DIR, 'extension-api.d.ts');
const FRAGMENT_DIRS = ['common', 'api'];

// a plain block comment and not the usual /**** banner: TypeDoc reads any /** comment before a
// `declare module` as its documentation, which would hide the @module comment of extension-api.d.ts
const LICENSE_HEADER = `/*
 * Copyright (C) YYYY Red Hat, Inc.
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
 */
`;
const COPYRIGHT_YEAR = /^( \* Copyright \(C\) )\d{4}( Red Hat, Inc\.)$/m;

async function parse(filePath: string): Promise<typescript.SourceFile> {
  const content = await readFile(filePath, 'utf-8');
  return typescript.createSourceFile(filePath, content, typescript.ScriptTarget.Latest, true);
}

async function listFragments(dir: string): Promise<string[]> {
  try {
    const files = await readdir(join(SRC_DIR, dir), { recursive: true, encoding: 'utf-8' });
    return files.map(file => join(dir, file));
  } catch (error: unknown) {
    // the directory is created with its first fragment
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

function toPosix(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}

// fragments are named by their path relative to src/, e.g. common/disposable.d.ts
const fragments = (await Promise.all(FRAGMENT_DIRS.map(listFragments)))
  .flat()
  .filter(file => file.endsWith('.d.ts'))
  .map(toPosix)
  .toSorted((a, b) => a.localeCompare(b));

const entry = await parse(ENTRY_FILE);
const entryReferences = entry.referencedFiles.map(reference =>
  toPosix(relative(SRC_DIR, resolve(SRC_DIR, reference.fileName))),
);

function expectSingleAmbientModuleBlock(sourceFile: typescript.SourceFile): void {
  // a top-level import or export turns the file into a module and the block into an augmentation
  expect(typescript.isExternalModule(sourceFile)).toBe(false);
  expect(sourceFile.statements).toHaveLength(1);

  const [statement] = sourceFile.statements;
  assert(statement && typescript.isModuleDeclaration(statement), 'the statement is not a module declaration');
  assert(typescript.isStringLiteral(statement.name), 'the module name is not a string literal');
  expect(statement.name.text).toBe(MODULE_NAME);
  // `declare module '@podman-desktop/api';` without a body would declare nothing
  expect(statement.body && typescript.isModuleBlock(statement.body)).toBe(true);
  const modifiers = typescript.getModifiers(statement) ?? [];
  expect(modifiers.some(modifier => modifier.kind === typescript.SyntaxKind.DeclareKeyword)).toBe(true);
}

describe('extension-api.d.ts', () => {
  test('has a single declare module block', () => {
    expectSingleAmbientModuleBlock(entry);
  });

  // fragments are listed from the disk and sorted, so this also checks that the references exist and are sorted
  test('references every fragment, in sorted order', () => {
    expect(entryReferences).toEqual(fragments);
  });
});

describe.each(fragments)('%s', fragment => {
  const filePath = join(SRC_DIR, fragment);

  test('has the license header', async () => {
    const content = await readFile(filePath, 'utf-8');
    expect(content.replace(COPYRIGHT_YEAR, '$1YYYY$2').startsWith(LICENSE_HEADER)).toBe(true);
  });

  test(`has exactly one declare module '${MODULE_NAME}' block and no imports or exports`, async () => {
    expectSingleAmbientModuleBlock(await parse(filePath));
  });

  test('has no doc comment before the declare module block', async () => {
    const { text } = await parse(filePath);
    const docComments = (typescript.getLeadingCommentRanges(text, 0) ?? []).filter(range =>
      text.startsWith('/**', range.pos),
    );
    expect(docComments).toEqual([]);
  });
});
