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

import type { ContainerProviderConnection } from '@podman-desktop/api';

export interface ManifestCreateOptions {
  images: string[];
  name: string;
  amend?: boolean;
  all?: boolean;

  // Provider to use for the manifest creation, if not, we will try to select the first one available (similar to podCreate)
  provider?: ContainerProviderConnection;
}

export interface ManifestInspectInfo {
  engineId: string;
  engineName: string;
  manifests: {
    digest: string;
    mediaType: string;
    platform: {
      architecture: string;
      features?: string[];
      os: string;
      variant?: string;
    };
    size: number;
    urls?: string[];
  }[];
  mediaType: string;
  schemaVersion: number;
}

export interface ManifestPushOptions {
  destination: string;
  name: string;
  all?: boolean;

  // Provider to use for the manifest pushing, if not, we will default to the first one available
  provider?: ContainerProviderConnection;
}
