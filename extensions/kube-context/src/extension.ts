/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import * as extensionApi from '@podman-desktop/api';
import * as jsYaml from 'js-yaml';

interface KubeConfig {
  'current-context': string;
  contexts: KubeContext[];
}

interface KubeContext {
  name: string;
}

const menuItemsRegistered: extensionApi.Disposable[] = [];
let kubeconfigFile: string | undefined;
let statusBarItem: extensionApi.StatusBarItem;
let quickPicks: extensionApi.QuickPickItem[];

async function deleteContext(): Promise<void> {
  // remove the context from the list

  menuItemsRegistered.forEach(item => {
    item.dispose();
  });

  if (statusBarItem) {
    statusBarItem.dispose();
  }
}

export async function updateContext(
  extensionContext: extensionApi.ExtensionContext,
  kubeconfigFile: string,
): Promise<void> {
  // read the kubeconfig file using fs
  const kubeConfigRawContent = await fs.promises.readFile(kubeconfigFile, 'utf-8');

  // parse the content using jsYaml
  const kubeConfig = jsYaml.load(kubeConfigRawContent) as KubeConfig;

  // get the current context
  const currentContext = kubeConfig?.['current-context'];

  // get all contexts
  const contexts: KubeContext[] = kubeConfig?.['contexts'] ? kubeConfig['contexts'] : [];

  if (contexts.length > 0) {
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

  // create a status bar item to show the current context and allow switching
  if (!statusBarItem) {
    statusBarItem = extensionApi.window.createStatusBarItem();
    statusBarItem.command = 'kubecontext.quickpick';
    statusBarItem.tooltip = 'Current Kubernetes context';
    statusBarItem.iconClass = '${kube-icon}';
    statusBarItem.show();
    extensionContext.subscriptions.push(statusBarItem);
  }

  if (currentContext) {
    if (currentContext.length <= 20) {
      statusBarItem.text = currentContext;
    } else {
      statusBarItem.text = currentContext.substring(0, 20) + '...';
    }
  } else {
    statusBarItem.text = 'No context';
  }

  quickPicks = contexts.map(context => {
    return {
      label: context.name,
      description: context.name === currentContext ? 'Current Context' : undefined,
      picked: context.name === currentContext,
    };
  });
}

function getKubeconfig(): string | undefined {
  return kubeconfigFile;
}

async function setContext(newContext: string): Promise<void> {
  const file = getKubeconfig();
  if (!file) {
    await extensionApi.window.showErrorMessage('No kubeconfig file found');
    return;
  }
  // load the file
  const kubeConfigRawContent = fs.readFileSync(file, 'utf-8');

  // parse the content using jsYaml
  const kubeConfig = jsYaml.load(kubeConfigRawContent) as KubeConfig;

  // update the context
  if (kubeConfig) {
    kubeConfig['current-context'] = newContext;
  }

  // write again the file using promises fs
  await fs.promises.writeFile(
    file,
    jsYaml.dump(kubeConfig, { noArrayIndent: true, quotingType: '"', lineWidth: -1 }),
    'utf-8',
  );
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  console.log('starting extension kube-context');

  // grab current file
  const kubeconfigUri = extensionApi.kubernetes.getKubeconfig();

  kubeconfigFile = kubeconfigUri.fsPath;

  // if path exists, update context
  if (fs.existsSync(kubeconfigFile)) {
    await updateContext(extensionContext, kubeconfigFile);
  }

  // update context menu on change
  const disposeOnDidUpdate = extensionApi.kubernetes.onDidUpdateKubeconfig(
    async (event: extensionApi.KubeconfigUpdateEvent) => {
      // update the tray everytime .kube/config file is updated
      if (event.type === 'UPDATE' || event.type === 'CREATE') {
        kubeconfigFile = event.location.fsPath;
        await updateContext(extensionContext, kubeconfigFile);
      } else if (event.type === 'DELETE') {
        await deleteContext();
        kubeconfigFile = undefined;
      }
    },
  );
  extensionContext.subscriptions.push(disposeOnDidUpdate);

  const switchCommand = extensionApi.commands.registerCommand('kubecontext.switch', async (newContext: string) => {
    await setContext(newContext);
  });
  extensionContext.subscriptions.push(switchCommand);

  const quickPickCommand = extensionApi.commands.registerCommand('kubecontext.quickpick', async () => {
    const selectedContext = await extensionApi.window.showQuickPick(quickPicks, {
      placeHolder: 'Select a Kubernetes context',
    });
    if (selectedContext) {
      await setContext(selectedContext.label);
    }
  });
  extensionContext.subscriptions.push(quickPickCommand);
}

export function deactivate(): void {
  console.log('stopping kube-context extension');
}
