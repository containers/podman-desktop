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
import type { ContainerProviderConnection } from '@desktop-framework/extension-api';

import type { ProviderContainerConnectionInfo } from '/@/provider-info.js';

export interface SecretInfo {
  engineId: string;
  engineName: string;
  engineType: 'podman' | 'docker';
  Id: string;
  Name: string;
  CreatedAt?: string; // datetime
  UpdatedAt?: string; // datetime
  Labels?: Record<string, string>;
}

export interface SecretCreateOptions {
  name: string;
  provider?: ProviderContainerConnectionInfo | ContainerProviderConnection;
  data: string;
  labels?: Record<string, string>;
}

export interface SecretCreateResult {
  id: string;
  engineId: string;
}
