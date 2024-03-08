/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

export interface ExtensionError {
  message: string;
  stack?: string;
}
// contains the definition of the update of an extension
export interface ExtensionUpdateInfo {
  id: string;
  version: string;
  ociUri: string;
}

export interface ExtensionInfo {
  id: string;
  name: string;
  description: string;
  displayName: string;
  publisher: string;
  removable: boolean;
  version: string;
  state: string;
  error?: ExtensionError;
  path: string;
  readme: string;
  icon?: string | { light: string; dark: string };
  update?: {
    version: string;
    ociUri: string;
  };
}
