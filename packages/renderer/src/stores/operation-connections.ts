/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '/@api/provider-info';

import type { IConfigurationPropertyRecordedSchema } from '../../../main/src/plugin/configuration-registry';

interface OperationConnectionInfo {
  operationKey: symbol;
  providerInfo: ProviderInfo;
  connectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo | undefined;
  properties: IConfigurationPropertyRecordedSchema[];
  propertyScope: string;
  operationInProgress: boolean;
  operationSuccessful: boolean;
  operationStarted: boolean;
  errorMessage: string;
  tokenId?: number;
  formData?: { [key: string]: unknown };
}

// current create key
export const operationConnectionsInfo: Writable<Map<number, OperationConnectionInfo>> = writable(new Map());
