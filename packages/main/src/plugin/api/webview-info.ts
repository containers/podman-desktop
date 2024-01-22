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

export interface WebviewInfo {
  id: string;
  uuid: string;
  viewType: string;
  sourcePath: string;
  icon: string | { readonly light: string; readonly dark: string } | undefined;
  name: string;
  html: string;
  // persistent state of the webview
  state: unknown;
}

export interface WebviewSimpleInfo {
  id: string;
  viewType: string;
  title: string;
}
