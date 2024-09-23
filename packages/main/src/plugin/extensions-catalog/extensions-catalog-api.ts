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

/**
 * Definition of interfaces shared by the renderer and the main process
 */

// format of what can be fetched online
export interface CatalogFetchableExtension {
  extensionId: string;
  link: string;
  version: string;
}

// exposed extensions
export interface CatalogExtension {
  id: string;
  publisherName: string;
  shortDescription: string;
  publisherDisplayName: string;
  extensionName: string;
  displayName: string;
  categories: string[];
  keywords: string[];
  unlisted: boolean;
  versions: CatalogExtensionVersion[];
}

interface CatalogExtensionVersion {
  version: string;
  podmanDesktopVersion?: string;
  ociUri: string;
  preview: boolean;
  lastUpdated: Date;
  files: CatalogExtensionVersionFile[];
}

interface CatalogExtensionVersionFile {
  assetType: 'icon' | 'LICENSE' | 'README';
  data: string;
}
