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

import type { Locator, Page } from '@playwright/test';

import { ResourcesPage } from './resources-page';

export class ResourcesPodmanConnections extends ResourcesPage {
  readonly providerConnections: Locator;
  readonly podmanMachineElement: Locator;
  readonly machineConnectionStatus: Locator;
  readonly machineDetailsButton: Locator;
  readonly machineConnectionActions: Locator;
  readonly machineStartButton: Locator;
  readonly machineRestartButton: Locator;
  readonly machineStopButton: Locator;
  readonly machineDeleteButton: Locator;

  constructor(page: Page, machineVisibleName: string) {
    super(page);
    this.providerConnections = this.podmanResources.getByRole('region', { name: 'Provider Connections' });
    this.podmanMachineElement = this.providerConnections.getByRole('region', { name: machineVisibleName });
    this.machineConnectionStatus = this.podmanMachineElement.getByLabel('Connection Status Label');
    this.machineDetailsButton = this.podmanMachineElement.getByRole('button', { name: 'Podman details' });
    this.machineConnectionActions = this.podmanMachineElement.getByRole('group', { name: 'Connection Actions' });
    this.machineStartButton = this.machineConnectionActions.getByRole('button', { name: 'Start', exact: true });
    this.machineRestartButton = this.machineConnectionActions.getByRole('button', { name: 'Restart' });
    this.machineStopButton = this.machineConnectionActions.getByRole('button', { name: 'Stop' });
    this.machineDeleteButton = this.machineConnectionActions.getByRole('button', { name: 'Delete' });
  }
}
