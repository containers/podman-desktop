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

import type { ProviderImages } from '@podman-desktop/api';

export type BinaryProviderName = 'download' | 'brew' | 'chocolate' | string;

export type CliToolState =
  | 'setup-needed'
  | 'detection-pending'
  | 'detecting'
  | 'installation-pending'
  | 'installing'
  | 'update-pending'
  | 'updating'
  | 'installed'
  | 'uninstall-pending'
  | 'uninstalling'
  | 'unknown';

export interface CliToolInfo {
  id: number;
  name: string;
  description: string;
  displayName: string;
  state: CliToolState;
  images?: ProviderImages;
  providedBy: string;
  binaries?: CliToolBinaryInfo[];
}

export interface CliToolBinaryInfo {
  location: string;
  version: string;
  binaryProviderName: BinaryProviderName;
  systemWide: boolean;
  installedOn: Date;
}
