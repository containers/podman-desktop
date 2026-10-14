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

import * as fs from 'node:fs';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

import type { OverriddenExtension } from '@desktop-framework/api';
import type * as containerDesktopAPI from '@desktop-framework/extension-api';
import { injectable } from 'inversify';
import { z } from 'zod';

import { ExtensionManifest, ExtensionManifestSchema } from './extension-manifest-schema.js';

export interface AnalyzedExtension {
  id: string;
  name: string;
  // root folder (where is package.json)
  path: string;
  manifest: ExtensionManifest;
  // main entry
  mainPath?: string;
  api?: typeof containerDesktopAPI;
  removable: boolean;
  bundled: boolean;

  // the bundled extension replaced by this extension, if any
  overrides?: OverriddenExtension;

  // true if the extension is running in development mode
  // it means we're using a separate development folder
  devMode: boolean;

  readme: string;

  update?: {
    version: string;
    ociUri: string;
  };

  missingDependencies?: string[];
  circularDependencies?: string[];

  error?: string;

  readonly subscriptions: containerDesktopAPI.Disposable[];

  dispose(): void;
}

export interface ExtensionAnalyzerOptions {
  extensionPath: string;
  removable: boolean;
  devMode?: boolean;
  bundled?: boolean;
  overrides?: OverriddenExtension;
}

@injectable()
export class ExtensionAnalyzer {
  async analyzeExtension({
    extensionPath,
    removable,
    devMode,
    bundled,
    overrides,
  }: ExtensionAnalyzerOptions): Promise<AnalyzedExtension> {
    const resolvedExtensionPath = await realpath(extensionPath);
    // do nothing if there is no package.json file
    let error = undefined;
    if (!fs.existsSync(path.resolve(resolvedExtensionPath, 'package.json'))) {
      error = `Ignoring extension ${resolvedExtensionPath} without package.json file`;
      console.warn(error);
      const analyzedExtension: AnalyzedExtension = {
        id: '<unknown>',
        name: '<unknown>',
        path: resolvedExtensionPath,
        manifest: {} as unknown as ExtensionManifest,
        readme: '',
        api: <typeof containerDesktopAPI>{},
        removable: removable,
        devMode: devMode ?? false,
        bundled: bundled ?? false,
        overrides,
        subscriptions: [],
        dispose(): void {},
        error,
      };
      return analyzedExtension;
    }

    // log error if the manifest is missing required entries
    const manifest = await this.loadManifest(resolvedExtensionPath);
    if (!manifest.name || !manifest.displayName || !manifest.version || !manifest.publisher || !manifest.description) {
      error = `Extension ${resolvedExtensionPath} missing required manifest entry in package.json (name, displayName, version, publisher, description)`;
      console.warn(error);
    }

    // create api object
    const disposables: containerDesktopAPI.Disposable[] = [];

    // is there a README.md file in the extension folder ?
    let readme = '';
    if (fs.existsSync(path.resolve(resolvedExtensionPath, 'README.md'))) {
      readme = await readFile(path.resolve(resolvedExtensionPath, 'README.md'), 'utf8');
    }

    const analyzedExtension: AnalyzedExtension = {
      id: `${manifest.publisher}.${manifest.name}`,
      name: manifest.name,
      manifest,
      path: resolvedExtensionPath,
      mainPath: manifest.main ? path.resolve(resolvedExtensionPath, manifest.main) : undefined,
      readme,
      removable,
      devMode: devMode ?? false,
      bundled: bundled ?? false,
      overrides,
      subscriptions: disposables,
      dispose(): void {
        for (const disposable of disposables) {
          disposable.dispose();
        }
      },
      error,
    };

    return analyzedExtension;
  }

  async loadManifest(extensionPath: string): Promise<ExtensionManifest> {
    const manifestPath = path.join(extensionPath, 'package.json');
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

    // try to parse using zod
    const result = ExtensionManifestSchema.safeParse(manifest);
    if (result.success) {
      return result.data;
    } else {
      console.error(`Error while parsing manifest for extension ${extensionPath}. ${z.prettifyError(result.error)}`);
      // return the manifest as it is, even if it is not valid
      return manifest as ExtensionManifest;
    }
  }
}
