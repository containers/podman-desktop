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
import type { FeaturedExtension } from '../featured/featured-api.js';

export interface ExtensionBanner {
  extensionId: string;
  featured: FeaturedExtension;
  title: string;
  description: string;
  icon: string;
  thumbnail: string;
  publishDate?: string;
  background?: {
    // Light and dark colors for the backgrounds in base64. Ex: "data:image/png;base64,<data-here>"
    light?: string;
    dark?: string;
    gradient?: {
      start: string;
      end: string;
    };
  };
}

export interface RecommendedRegistryExtensionDetails {
  id: string;
  fetchLink?: string;
  fetchVersion?: string;
  displayName: string;
  fetchable: boolean;
}
export interface RecommendedRegistry {
  // FQN like vendor.my-extension
  extensionId: string;
  // name of the extension
  name: string;
  // The unique id of the registry like foo.my-domain.com
  id: string;
  // errors to match like ['unauthorized']
  errors: string[];

  // extension is installed or not ?
  isInstalled: boolean;

  extensionDetails: RecommendedRegistryExtensionDetails;
}
