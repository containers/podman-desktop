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

import type {
  Link,
  ProviderCleanupAction,
  ProviderConnectionStatus,
  ProviderDetectionCheck,
  ProviderImages,
  ProviderInformation,
  ProviderLinks,
  ProviderStatus,
} from '@podman-desktop/api';

export type LifecycleMethod = 'start' | 'stop' | 'delete' | 'edit';

export interface ProviderContainerConnectionInfo {
  name: string;
  status: ProviderConnectionStatus;
  endpoint: {
    socketPath: string;
  };
  lifecycleMethods?: LifecycleMethod[];
  type: 'docker' | 'podman';
}

export interface ProviderKubernetesConnectionInfo {
  name: string;
  status: ProviderConnectionStatus;
  endpoint: {
    apiURL: string;
  };
  lifecycleMethods?: LifecycleMethod[];
}

export interface ProviderInfo {
  internalId: string;
  id: string;
  readonly extensionId: string;
  name: string;
  containerConnections: ProviderContainerConnectionInfo[];
  kubernetesConnections: ProviderKubernetesConnectionInfo[];
  status: ProviderStatus;
  lifecycleMethods?: LifecycleMethod[];
  // can create provider connection from ContainerProviderConnectionFactory params
  containerProviderConnectionCreation: boolean;
  // can initialize provider connection from ContainerProviderConnectionFactory params
  containerProviderConnectionInitialization: boolean;

  // optional creation name (if defined)
  containerProviderConnectionCreationDisplayName?: string;

  // optional creation button title (if defined)
  containerProviderConnectionCreationButtonTitle?: string;

  // can create provider connection from KubernetesProviderConnectionFactory params
  kubernetesProviderConnectionCreation: boolean;
  // can initialize provider connection from KubernetesProviderConnectionFactory params
  kubernetesProviderConnectionInitialization: boolean;

  // optional creation name (if defined)
  kubernetesProviderConnectionCreationDisplayName?: string;

  // optional creation button title (if defined)
  kubernetesProviderConnectionCreationButtonTitle?: string;

  emptyConnectionMarkdownDescription?: string;

  version?: string;

  links: ProviderLinks[];
  detectionChecks: ProviderDetectionCheck[];

  // warning messages regarding the provider
  warnings: ProviderInformation[];

  images: ProviderImages;

  // can install a provider
  installationSupport: boolean;

  // can perform cleanup operation
  cleanupSupport: boolean;

  // can update a provider
  updateInfo?: {
    version: string;
  };
}

export interface PreflightChecksCallback {
  startCheck: (status: CheckStatus) => void;
  endCheck: (status: CheckStatus) => void;
}

export interface CheckStatus {
  name: string;
  successful?: boolean;
  description?: string;
  docLinks?: Link[];
}

export interface PreflightCheckEvent {
  type: 'start' | 'stop';
  status: CheckStatus;
}

export interface ProviderCleanupActionInfo {
  providerId: string;
  providerName: string;
  actions: Promise<ProviderCleanupAction[]>;
  instance: unknown;
}
