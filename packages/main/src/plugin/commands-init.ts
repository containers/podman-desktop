/**********************************************************************
 * Copyright (C) 2025-2026 Red Hat, Inc.
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

import type {
  IDisposable,
  KubernetesNavigationRequest,
  ProviderContainerConnectionInfo,
  PullEvent,
} from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { Uri } from '@desktop-framework/extension-api';
import { inject, injectable } from 'inversify';

import { securityRestrictionCurrentHandler } from '/@/security-restrictions-handler.js';

import { CommandRegistry } from './command-registry.js';
import { ContainerProviderRegistry } from './container-registry.js';
import { NavigationManager } from './navigation/navigation-manager.js';
import { TaskManager } from './tasks/task-manager.js';
import type { TaskAction } from './tasks/tasks.js';

@injectable()
export class CommandsInit implements IDisposable {
  #disposables: IDisposable[] = [];
  constructor(
    @inject(CommandRegistry)
    private commandRegistry: CommandRegistry,
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
    @inject(NavigationManager)
    private navigationManager: NavigationManager,
    @inject(TaskManager)
    private taskManager: TaskManager,
    @inject(ContainerProviderRegistry)
    private containerProviderRegistry: ContainerProviderRegistry,
  ) {}

  init(): void {
    const commandRegistry = this.getCommandRegistry();
    this.#disposables.push(
      commandRegistry.registerCommand('feedback', () => {
        this.getApiSender().send('display-feedback');
      }),
    );

    this.#disposables.push(
      commandRegistry.registerCommand('help', () => {
        this.getApiSender().send('toggle-help-menu');
      }),
    );

    this.#disposables.push(
      commandRegistry.registerCommand('troubleshooting', () => {
        return this.getNavigationManager().navigateToTroubleshooting();
      }),
    );

    this.#disposables.push(
      commandRegistry.registerCommand('kubernetes-navigation', (navRequest: KubernetesNavigationRequest) => {
        this.getApiSender().send('kubernetes-navigation', navRequest);
      }),
    );

    this.#disposables.push(
      commandRegistry.registerCommand(
        'pullImage',
        async (
          providerContainerConnectionInfo: ProviderContainerConnectionInfo,
          imageName: string,
          callback: (event: PullEvent) => void,
          platform?: string,
          taskActionName?: string,
          taskActionCallback?: () => void,
        ) => {
          if (!providerContainerConnectionInfo || !imageName || typeof callback !== 'function') {
            return;
          }

          let taskAction: TaskAction | undefined;

          if (taskActionName && typeof taskActionName === 'string' && typeof taskActionCallback === 'function') {
            taskAction = {
              name: taskActionName,
              execute: taskActionCallback,
            };
          }

          const task = this.getTaskManager().createTask({
            title: `Pulling ${imageName}`,
            action: taskAction,
          });

          return this.getContainerProviderRegistry()
            .pullImage(providerContainerConnectionInfo, imageName, callback, platform)
            .then(result => {
              task.status = 'success';
              return result;
            })
            .catch((error: unknown) => {
              task.error = `Something went wrong while trying to pull ${imageName}: ${error};`;
              throw error;
            });
        },
      ),
    );

    this.#disposables.push(
      commandRegistry.registerCommand('openExternal', async (arg: Uri) => {
        if (arg) {
          const url = arg.toString();
          try {
            await securityRestrictionCurrentHandler.handler?.(url);
          } catch (error: unknown) {
            const message = `Unable to open external link ${url}`;
            console.error(message, error);
            throw new Error(message, { cause: error });
          }
        }
      }),
    );
  }

  dispose(): void {
    this.#disposables.forEach(disposable => disposable.dispose());
  }

  protected getCommandRegistry(): CommandRegistry {
    return this.commandRegistry;
  }

  protected getApiSender(): ApiSenderType {
    return this.apiSender;
  }

  protected getNavigationManager(): NavigationManager {
    return this.navigationManager;
  }

  protected getTaskManager(): TaskManager {
    return this.taskManager;
  }

  protected getContainerProviderRegistry(): ContainerProviderRegistry {
    return this.containerProviderRegistry;
  }
}
