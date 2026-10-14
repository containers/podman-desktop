/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
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
} from '@desktop-framework/extension-api';

export type LifecycleMethod = 'start' | 'stop' | 'delete' | 'edit';

export interface ProviderContainerConnectionInfo {
  connectionType: 'container';
  name: string;
  displayName: string;
  status: ProviderConnectionStatus;
  error?: string;
  endpoint: {
    socketPath: string;
  };
  lifecycleMethods?: LifecycleMethod[];
  // can start the connection
  canStart: boolean;
  // can stop the connection
  canStop: boolean;
  // can edit the connection
  canEdit: boolean;
  // can delete the connection
  canDelete: boolean;
  /**
   * Specify if the corresponding {@link import('@desktop-framework/extension-api').ProviderContainerConnection} instance
   * has a shellAccess available
   */
  shellAccess?: boolean;
  type: 'docker' | 'podman';
  vmType?: { id: string; name: string };
}

export interface ProviderKubernetesConnectionInfo {
  connectionType: 'kubernetes';
  name: string;
  status: ProviderConnectionStatus;
  error?: string;
  endpoint: {
    apiURL: string;
  };
  lifecycleMethods?: LifecycleMethod[];
  // can start the connection
  canStart: boolean;
  // can stop the connection
  canStop: boolean;
  // can edit the connection
  canEdit: boolean;
  // can delete the connection
  canDelete: boolean;
}

export interface ProviderVmConnectionInfo {
  connectionType: 'vm';
  name: string;
  status: ProviderConnectionStatus;
  error?: string;
  lifecycleMethods?: LifecycleMethod[];
  // can start the connection
  canStart: boolean;
  // can stop the connection
  canStop: boolean;
  // can edit the connection
  canEdit: boolean;
  // can delete the connection
  canDelete: boolean;
}

export type ProviderConnectionInfo =
  | ProviderContainerConnectionInfo
  | ProviderKubernetesConnectionInfo
  | ProviderVmConnectionInfo;

export interface ProviderInfo {
  internalId: string;
  id: string;
  readonly extensionId: string;
  name: string;
  containerConnections: ProviderContainerConnectionInfo[];
  kubernetesConnections: ProviderKubernetesConnectionInfo[];
  vmConnections: ProviderVmConnectionInfo[];
  status: ProviderStatus;
  lifecycleMethods?: LifecycleMethod[];
  // can start the provider
  canStart: boolean;
  // can stop the provider
  canStop: boolean;
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

  // can create provider connection from VmProviderConnectionFactory params
  vmProviderConnectionCreation: boolean;
  // can initialize provider connection from VmProviderConnectionFactory params
  vmProviderConnectionInitialization: boolean;

  // optional creation name (if defined)
  vmProviderConnectionCreationDisplayName?: string;

  // optional creation button title (if defined)
  vmProviderConnectionCreationButtonTitle?: string;

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
  severity?: 'error' | 'warning';
  description?: string;
  docLinksDescription?: string;
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
