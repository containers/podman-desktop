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

import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

import typescript from 'typescript';
import { describe, expect, test } from 'vitest';

// Guardrails for the extension API split in several files, see README.md

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
const COPYRIGHT_YEARS = /^( \* Copyright \(C\) )\d{4}(-\d{4})?/m;

async function parse(filePath: string): Promise<typescript.SourceFile> {
  const content = await readFile(filePath, 'utf-8');
  return typescript.createSourceFile(filePath, content, typescript.ScriptTarget.Latest, true);
}

async function listFragments(dir: string): Promise<string[]> {
  if (!existsSync(join(SRC_DIR, dir))) {
    return [];
  }
  const files = await readdir(join(SRC_DIR, dir), { recursive: true, encoding: 'utf-8' });
  return files.map(file => join(dir, file));
}

function toPosix(filePath: string): string {
  return filePath.split('\\').join('/');
}

// fragments are named by their path relative to src/, e.g. common/disposable.d.ts
const fragments = (await Promise.all(FRAGMENT_DIRS.map(listFragments)))
  .flat()
  .filter(file => file.endsWith('.d.ts'))
  .map(toPosix)
  .sort((a, b) => a.localeCompare(b));

const entry = await parse(ENTRY_FILE);
const entryReferences = entry.referencedFiles.map(reference =>
  toPosix(relative(SRC_DIR, resolve(SRC_DIR, reference.fileName))),
);

function expectSingleAmbientModuleBlock(sourceFile: typescript.SourceFile): void {
  // a top-level import or export turns the file into a module and the block into an augmentation
  expect(typescript.isExternalModule(sourceFile)).toBeFalsy();
  expect(sourceFile.statements).toHaveLength(1);

  const [statement] = sourceFile.statements;
  expect(statement && typescript.isModuleDeclaration(statement)).toBeTruthy();
  const moduleDeclaration = statement as typescript.ModuleDeclaration;
  expect(typescript.isStringLiteral(moduleDeclaration.name)).toBeTruthy();
  expect(moduleDeclaration.name.text).toBe(MODULE_NAME);
  const modifiers = typescript.getModifiers(moduleDeclaration) ?? [];
  expect(modifiers.some(modifier => modifier.kind === typescript.SyntaxKind.DeclareKeyword)).toBeTruthy();
}

describe('extension-api.d.ts', () => {
  test('has a single declare module block', () => {
    expectSingleAmbientModuleBlock(entry);
  });

  test('references are sorted', () => {
    expect(entryReferences).toEqual(entryReferences.toSorted((a, b) => a.localeCompare(b)));
  });

  test('references only existing files', () => {
    for (const reference of entryReferences) {
      expect(existsSync(join(SRC_DIR, reference)), `${reference} does not exist`).toBeTruthy();
    }
  });

  test('references every fragment', () => {
    expect(entryReferences).toEqual(fragments);
  });
});

describe.each(fragments)('%s', fragment => {
  const filePath = join(SRC_DIR, fragment);

  test('has the license header', async () => {
    const content = await readFile(filePath, 'utf-8');
    expect(content.replace(COPYRIGHT_YEARS, '$1YYYY').startsWith(LICENSE_HEADER)).toBeTruthy();
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
