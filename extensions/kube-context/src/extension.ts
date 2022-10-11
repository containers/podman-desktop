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

import * as extensionApi from '@tmpwip/extension-api';
import * as fs from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import * as jsYaml from 'js-yaml';

interface KubeContext {
  name: string;
}

const menuItemsRegistered: extensionApi.Disposable[] = [];

// path to kube config file
const kubeConfigFile = resolve(homedir(), '.kube', 'config');

async function deleteContext(): Promise<void> {
  // remove the context from the list

  menuItemsRegistered.forEach(item => {
    item.dispose();
  });
  return;
}

async function updateContext(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // read the kubeconfig file using fs
  const kubeConfigRawContent = await fs.promises.readFile(kubeConfigFile, 'utf-8');

  // parse the content using jsYaml
  const kubeConfig = jsYaml.load(kubeConfigRawContent);

  // get the current context
  const currentContext = kubeConfig['current-context'];

  // get all contexts
  const contexts: KubeContext[] = kubeConfig['contexts'];

  // now, add each context
  const subitems: extensionApi.MenuItem[] = contexts.map(context => {
    return {
      label: context.name,
      id: 'kubecontext.switch',
      type: 'checkbox',
      checked: context.name === currentContext,
    };
  });

  const title: extensionApi.MenuItem = {
    label: 'Context',
    id: 'kubecontext.switch',
    enabled: false,
  };

  const item: extensionApi.MenuItem = {
    id: 'kubecontext.switch',
    label: 'Kubernetes',
    submenu: [title, ...subitems],
  };

  const subscription = extensionApi.tray.registerMenuItem(item);
  menuItemsRegistered.push(subscription);
  extensionContext.subscriptions.push(subscription);
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  console.log('starting extension kube-context');

  // monitor the kube config file for changes
  const kubeConfigWatcher = extensionApi.fs.createFileSystemWatcher(kubeConfigFile);

  // update the tray everytime .kube/config file is updated
  kubeConfigWatcher.onDidChange(() => {
    updateContext(extensionContext);
  });

  kubeConfigWatcher.onDidCreate(() => {
    updateContext(extensionContext);
  });

  kubeConfigWatcher.onDidDelete(() => {
    deleteContext();
  });

  extensionContext.subscriptions.push(kubeConfigWatcher);

  const command = extensionApi.commands.registerCommand('kubecontext.switch', async (newContext: string) => {
    // load the file
    const kubeConfigRawContent = fs.readFileSync(kubeConfigFile, 'utf-8');

    // parse the content using jsYaml
    const kubeConfig = jsYaml.load(kubeConfigRawContent);

    // update the context
    kubeConfig['current-context'] = newContext;

    // write again the file using promises fs
    await fs.promises.writeFile(
      kubeConfigFile,
      jsYaml.dump(kubeConfig, { noArrayIndent: true, quotingType: '"', lineWidth: -1 }),
      'utf-8',
    );
  });

  extensionContext.subscriptions.push(command);
}

export function deactivate(): void {
  console.log('stopping kube-context extension');
}
