/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
import type { IDisposable } from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { PinOption } from '@desktop-framework/api/status-bar';
import { STATUS_BAR_PIN_CONSTANTS } from '@desktop-framework/api/status-bar';
import type * as containerDesktopAPI from '@desktop-framework/extension-api';
import { inject, injectable } from 'inversify';

import { CommandRegistry } from '/@/plugin/command-registry.js';
import { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { ProviderRegistry } from '/@/plugin/provider-registry.js';
import { Telemetry } from '/@/plugin/telemetry/telemetry.js';

export enum PIN_REGISTRY_TELEMETRY_EVENTS {
  PIN = 'pin-registry:pin',
  UNPIN = 'pin-registry:unpin',
  OPTIONS = 'pin-registry:options',
}

/**
 * The {@link PinRegistry} hold the pinned options on the providers part of the status bar.
 */
@injectable()
export class PinRegistry implements IDisposable {
  #disposables: IDisposable[] = [];
  // default to podman
  #pinned: Set<string> = new Set(['podman']);
  #configuration: containerDesktopAPI.Configuration | undefined;

  constructor(
    @inject(CommandRegistry)
    private commandRegistry: CommandRegistry,
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
    @inject(ConfigurationRegistry)
    private configurationRegistry: ConfigurationRegistry,
    @inject(ProviderRegistry)
    private providers: ProviderRegistry,
    @inject(Telemetry)
    private telemetry: Telemetry,
  ) {}

  dispose(): void {
    this.#disposables.forEach(disposable => disposable.dispose());
    this.#disposables = [];
    this.#pinned.clear();
  }

  private notify(): void {
    this.apiSender.send(STATUS_BAR_PIN_CONSTANTS.PIN_OPTIONS_UPDATE, this.getOptions());
  }

  public pin(optionId: string): void {
    this.#pinned.add(optionId);
    this.notify();
    // save async
    this.save().catch(console.error);

    // track event
    this.telemetry.track(PIN_REGISTRY_TELEMETRY_EVENTS.PIN, {
      optionId: optionId,
    });
  }

  public unpin(optionId: string): void {
    this.#pinned.delete(optionId);
    this.notify();
    // save async
    this.save().catch(console.error);

    // track event
    this.telemetry.track(PIN_REGISTRY_TELEMETRY_EVENTS.UNPIN, {
      optionId: optionId,
    });
  }

  public getOptions(): Array<PinOption> {
    return this.providers
      .getProviderInfos()
      .filter(
        provider =>
          provider.containerConnections.length > 0 ||
          provider.kubernetesConnections.length > 0 ||
          provider.vmConnections.length > 0,
      )
      .map(provider => ({
        value: provider.id,
        label: provider.name,
        pinned: this.#pinned.has(provider.id),
      }));
  }

  private async save(): Promise<void> {
    if (!this.#configuration) throw new Error('missing configuration object: cannot save');

    await this.#configuration.update(
      STATUS_BAR_PIN_CONSTANTS.PINNED_CONFIGURATION_PROPERTY,
      Array.from(this.#pinned.values()),
    );
  }

  init(): void {
    // register toggle menu command
    this.#disposables.push(
      this.commandRegistry.registerCommand(STATUS_BAR_PIN_CONSTANTS.TOGGLE_MENU_COMMAND, () => {
        this.apiSender.send(STATUS_BAR_PIN_CONSTANTS.TOGGLE_MENU);
      }),
    );

    // register configuration for persistence
    this.#disposables.push(
      this.configurationRegistry.registerConfigurations([
        {
          id: STATUS_BAR_PIN_CONSTANTS.STATUS_BAR_CONFIGURATION,
          title: 'Status Bar Pin',
          type: 'object',
          properties: {
            [STATUS_BAR_PIN_CONSTANTS.PINNED_CONFIGURATION_PROPERTY]: {
              description: 'pinned items in the status bar',
              type: 'array',
              hidden: true,
              default: ['podman'],
            },
          },
        },
      ]),
    );

    this.#configuration = this.configurationRegistry.getConfiguration(
      STATUS_BAR_PIN_CONSTANTS.STATUS_BAR_CONFIGURATION,
    );
    const options = this.#configuration.get<Array<string>>(STATUS_BAR_PIN_CONSTANTS.PINNED_CONFIGURATION_PROPERTY);
    if (options) {
      this.#pinned = new Set<string>(options);
      this.notify();

      // track user defined options
      this.telemetry.track(PIN_REGISTRY_TELEMETRY_EVENTS.OPTIONS, {
        options: options,
      });
    }

    // ==== notify if container connection / kubernetes / vm connection changed
    // containers
    this.#disposables.push(this.providers.onDidRegisterContainerConnection(this.notify.bind(this)));
    this.#disposables.push(this.providers.onDidUnregisterContainerConnection(this.notify.bind(this)));
    // kubernetes
    this.#disposables.push(this.providers.onDidRegisterKubernetesConnection(this.notify.bind(this)));
    this.#disposables.push(this.providers.onDidUnregisterKubernetesConnection(this.notify.bind(this)));
    // vm connections
    this.#disposables.push(this.providers.onDidRegisterVmConnection(this.notify.bind(this)));
    this.#disposables.push(this.providers.onDidUnregisterVmConnection(this.notify.bind(this)));
  }
}
