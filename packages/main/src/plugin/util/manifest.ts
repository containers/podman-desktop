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
import type { ImageInfo } from '/@api/image-info.js';

const KB = 1024;
const GUESSED_MANIFEST_SIZE = 50 * KB;

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
// - Connection type is "podman"
// - History is null or empty
// - Engine type is "podman"
// all of these conditions must be met to (safely) determine if the image is a manifest
//
// We will check this within ImageInfo
export function guessIsManifest(image: ImageInfo, connectionType: string): boolean {
  // There is an odd case that if the image has been renamed, we may not be able to safely detect
  // if it is a manifest or not.
  // ex. podman image tag testmanifest testmanifest123

  // This is a "hacky" way to do it, but we can check to see if the image has been renamed by anaylzing the digests
  // as they will be pointed

  // Create a map to count occurrences of each digest
  const digestMap = new Map<string, Set<string>>();

  // Populate the map with digests and corresponding tags
  if (image.RepoDigests) {
    for (const digest of image.RepoDigests) {
      const [repo, hash] = digest.split('@');
      const tagSet = digestMap.get(hash) ?? new Set<string>();
      image?.RepoTags?.forEach(tag => {
        if (tag.includes(repo)) {
          // Ensuring only relevant tags are counted
          tagSet.add(tag);
        }
      });
      digestMap.set(hash, tagSet);
    }
  }

  // Check if any digest has more than one unique tag
  let renamed = false;
  for (const tags of digestMap.values()) {
    if (tags.size > 1) {
      renamed = true;
      break;
    }
  }

  return Boolean(
    image.RepoTags &&
      image.RepoDigests &&
      image.RepoTags.length > 0 &&
      image.RepoDigests.length > 0 &&
      (!image.Labels || Object.keys(image.Labels).length === 0) &&
      // There will either be no history, OR it was renamed
      (!image.History || image.History.length === 0 || renamed) &&
      connectionType === 'podman' &&
      image.VirtualSize < GUESSED_MANIFEST_SIZE,
  );
}
