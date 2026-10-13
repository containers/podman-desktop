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

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Mustache from 'mustache';
import typescript from 'typescript';

type Namespaces = { [key: string]: string[] };
type Classes = { [key: string]: string[] };

// The API is split across several files: follow `/// <reference path="..." />` from the entry file.
// Files are keyed by their path on disk: SourceFile.fileName is normalized with forward slashes by TypeScript
async function readAPISourceFiles(entryPath: string): Promise<Map<string, typescript.SourceFile>> {
  const sourceFiles = new Map<string, typescript.SourceFile>();
  const visited = new Set<string>();

  const read = async (filePath: string): Promise<void> => {
    if (visited.has(filePath)) {
      return;
    }
    visited.add(filePath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const sourceFile = typescript.createSourceFile(filePath, fileContent, typescript.ScriptTarget.Latest, true);
    for (const reference of sourceFile.referencedFiles) {
      await read(path.resolve(path.dirname(filePath), reference.fileName));
    }
    sourceFiles.set(filePath, sourceFile);
  };

  await read(entryPath);
  return sourceFiles;
}

function extractNamespacesAndClassesFromAPI(sourceFiles: typescript.SourceFile[]): {
  namespaces: Namespaces;
  classes: Classes;
} {
  const namespaces: Namespaces = {};
  const classes: Classes = {};

  const visit = (node: typescript.Node): void => {
    if (typescript.isModuleDeclaration(node) && node.name.text) {
      if (node.name.text === '@podman-desktop/api') {
        typescript.forEachChild(node, visit);
        return;
      }

      const namespaceName = node.name.text;
      const functions: string[] = [];

      if (node.body && typescript.isModuleBlock(node.body)) {
        for (const statement of node.body.statements) {
          if (typescript.isFunctionDeclaration(statement) && statement.name) {
            functions.push(statement.name.text);
          } else if (typescript.isVariableStatement(statement)) {
            for (const declaration of statement.declarationList.declarations) {
              if (typescript.isIdentifier(declaration.name)) {
                functions.push(declaration.name.text);
              }
            }
          }
        }
      }

      if (functions.length > 0) {
        // Deduplicate to handle function overloads and namespaces declared in several files
        namespaces[namespaceName] = Array.from(new Set([...(namespaces[namespaceName] ?? []), ...functions]));
      }
    }

    if (typescript.isClassDeclaration(node) && node.name) {
      const modifiers = typescript.getModifiers(node);
      const isExported = modifiers?.some(m => m.kind === typescript.SyntaxKind.ExportKeyword);
      if (isExported) {
        const className = node.name.text;
        const methods: string[] = [];
        for (const member of node.members) {
          if (typescript.isMethodDeclaration(member) && member.name && typescript.isIdentifier(member.name)) {
            methods.push(member.name.text);
          }
        }
        // Deduplicate to handle method overloads
        classes[className] = Array.from(new Set([...(classes[className] ?? []), ...methods]));
      }
    }

    typescript.forEachChild(node, visit);
  };

  for (const sourceFile of sourceFiles) {
    visit(sourceFile);
  }
  return { namespaces, classes };
}

function toTemplateData(data: { namespaces: Namespaces; classes: Classes }): {
  namespaces: { name: string; functions: string[] }[];
  classes: { name: string; methods: string[] }[];
} {
  const namespaces = Object.entries(data.namespaces).map(([name, functions]) => ({ name, functions }));
  const classes = Object.entries(data.classes).map(([name, methods]) => ({ name, methods }));
  return { namespaces, classes };
}

export default async function setup(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const packageRoot = path.resolve(__dirname, '..');
  const repoRoot = path.resolve(packageRoot, '..', '..');
  const extensionApiTypePath = path.join(repoRoot, 'packages', 'extension-api', 'src', 'extension-api.d.ts');
  const podmanDesktopApiMocksDir = path.join(packageRoot, 'src', '@podman-desktop');
  const apiGeneratedFile = path.join(podmanDesktopApiMocksDir, 'api.ts');
  const templatePath = path.join(packageRoot, 'src', 'api.mustache');
  const productJsonPath = path.join(repoRoot, 'product.json');
  const packageProductJsonPath = path.join(packageRoot, 'src', 'product.json');

  const apiSourceFiles = await readAPISourceFiles(extensionApiTypePath);

  // skip if api.ts is already newer (from template or any extension API .d.ts file)
  const apiSourceFilesStats = await Promise.all(Array.from(apiSourceFiles.keys(), filePath => fs.stat(filePath)));
  const templatePathStats = await fs.stat(templatePath);
  const productJsonPathStats = await fs.stat(productJsonPath);
  try {
    const outputStats = await fs.stat(apiGeneratedFile);
    await fs.stat(packageProductJsonPath);
    const newestInputMtime = Math.max(
      ...apiSourceFilesStats.map(stats => stats.mtimeMs),
      templatePathStats.mtimeMs,
      productJsonPathStats.mtimeMs,
    );
    if (outputStats.mtimeMs >= newestInputMtime) {
      console.debug(' 🚀 packages/api-mocks-vitest/src/@podman-desktop/api.ts up-to-date; skipping regeneration');
      return;
    }
  } catch {
    console.debug(' ⚙️ packages/api-mocks-vitest/src/@podman-desktop/api.ts does not exist yet; generating it now…');
  }
  const data = extractNamespacesAndClassesFromAPI(Array.from(apiSourceFiles.values()));
  const template = await fs.readFile(templatePath, 'utf-8');
  const content = Mustache.render(template, toTemplateData(data));

  await fs.mkdir(podmanDesktopApiMocksDir, { recursive: true });
  await fs.copyFile(productJsonPath, packageProductJsonPath);
  await fs.writeFile(apiGeneratedFile, content, 'utf-8');
  console.debug(' ✅ packages/api-mocks-vitest/src/@podman-desktop/api.ts has been generated.');
}
