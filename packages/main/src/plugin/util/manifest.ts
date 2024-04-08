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

import type { ImageInfo } from '../api/image-info.js';

// 50 KB
const GUESSED_MANIFEST_SIZE = 51200;

// Function to safely "guess" if the image is actually a manifest
// IMPORTANT NOTE: 
// This is because there is no clear way to now what a manifest
// is in the Dockerode API / Podman API (yet). This is a workaround
// until we have a better way to determine if an image is a manifest
// See issue: https://github.com/containers/podman/issues/22184
//
// We will "safely" determine if an image is a manifest by checking:
// - VirtualSize is under 1MB, as the manifest is usually very small and only contains text
// - Labels is null or empty, as the manifest usually doesn't have any labels
// - RepoTags always exists, as the manifest has a tag associated
// - RepoDigests always exists as well, as the manifest has a digest associated
// - History is null or empty
// - Engine type is "podman"
// all of these conditions must be met to (safely) determine if the image is a manifest
//
// We will check this within ImageInfo
export function guessIsManifest(image: ImageInfo): boolean {
  return Boolean(
    image.RepoTags &&
      image.RepoDigests &&
      image.RepoTags.length > 0 &&
      image.RepoDigests.length > 0 &&
      (!image.Labels || Object.keys(image.Labels).length === 0) &&
      (!image.History || image.History.length === 0) && 
      image.engineName === 'podman' &&
      image.VirtualSize < GUESSED_MANIFEST_SIZE,
  );
}
