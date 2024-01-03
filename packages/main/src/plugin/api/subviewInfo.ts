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

export interface SubviewInfo {
  // unique identifier
  id: string;
  // the source (aka path to index.html)
  source: string;
  // name to display
  name: string;
  // base64 encoded icon in format: 'data:image/svg+xml;base64,<content>'
  icon: string;
  // extension id related to the subview
  extensionId?: string;
  // port use for the exposure and to allow the extension to connect to the service
  vmServicePort?: number;
}
