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

import path from 'node:path';
import { readFileSync } from 'node:fs';
import 'vitest-canvas-mock';
import typescript from 'typescript';
import { expect } from 'vitest';

global.window.matchMedia = () => {};

// read the given path and extract the method names from the Window interface
function extractWindowMethods(filePath) {
  // Read the content of the .d.ts file
  const fileContent = readFileSync(filePath, 'utf-8');

  // Create a TypeScript SourceFile
  const sourceFile = typescript.createSourceFile(filePath, fileContent, typescript.ScriptTarget.Latest, true);

  const methodNames = [];

  // Visit each node in the AST
  const visit = node => {
    // Look for the Window interface
    if (
      typescript.isInterfaceDeclaration(node) &&
      node.name.text === 'Window' // Target the "Window" interface
    ) {
      for (const member of node.members) {
        if (typescript.isPropertySignature(member) && member.type && typescript.isFunctionTypeNode(member.type)) {
          const name = member.name.text;
          methodNames.push(name);
        }
      }
    }

    typescript.forEachChild(node, visit);
  };

  visit(sourceFile);

  return methodNames;
}

// methods being exposed
const declarationsPath = path.resolve(__dirname, '../preload/exposedInMainWorld.d.ts');

// Extract method names from the Window interface
const methodNames = extractWindowMethods(declarationsPath);

// assert that we have more than 50 methods
expect(methodNames.length).toBeGreaterThan(50);

// Dynamically create vi mocks for all the given methods
for (const methodName of methodNames) {
  Object.defineProperty(window, methodName, {
    value: vi.fn(),
    configurable: true,
    writable: true,
  });
}
