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
export interface ImageSearchOptions {
  registry?: string;
  query: string;
  limit?: number;
}

export interface ImageSearchResult {
  name: string;
  description: string;
  star_count: number;
  is_official: boolean;
}

export interface ImageTagsListOptions {
  image: string;
}

/**
 * Result of checking if an image can be updated from a remote registry.
 */
export interface ImageUpdateStatus {
  /**
   * The status of the check operation.
   * - 'normal': Check completed successfully
   * - 'error': Check failed due to an error (registry errors, authentication failures, etc.)
   * - 'skipped': Check skipped due to the image being local or dangling
   */
  status: 'normal' | 'error' | 'skipped';

  /**
   * Whether an update is available from the remote registry.
   */
  updateAvailable: boolean;

  /**
   * The remote digest if an update is available.
   * Can be used for verification after pulling.
   */
  remoteDigest?: string;

  /**
   * Human-readable message describing the result.
   */
  message: string;
}

/**
 * Describes a single image to be updated via the backend.
 */
export interface ImageUpdateInfo {
  engineId: string;
  /** Image id, e.g. "sha256:…". Every tag referencing this image is updated. */
  id: string;
}

/**
 * Per-tag result returned by the backend updateImages call.
 */
export interface ImageUpdateResult {
  imageRef: string;
  updated: boolean;
  status: ImageUpdateStatus['status'] | 'updated';
  message: string;
}
