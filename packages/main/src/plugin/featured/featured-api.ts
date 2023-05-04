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

export interface FeaturedExtension {
  builtin: boolean;
  id: string;
  displayName: string;
  description: string;
  icon: string;
  categories: string[];
  // can be grabbed/fetched online
  fetchable: boolean;
  fetchLink?: string;
  fetchVersion?: string;
  // locally installed
  installed: boolean;
}
