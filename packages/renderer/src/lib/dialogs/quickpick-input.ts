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

import type { QuickPickItem } from '@podman-desktop/api';

export interface QuickPickOptions {
  placeHolder?: string;
  items: QuickPickItem[] | string[];
  prompt: string;
  id: number;
  canPickMany: boolean;
  // if true, needs to send the current element when item is selected
  onSelectCallback: boolean;
  title?: string;
}

export interface InputBoxOptions {
  placeHolder?: string;
  value?: string;
  valueSelection?: [number, number];
  // if true, the input box will be validated on each keystroke
  validate: boolean;
  prompt: string;
  id: number;
  title?: string;
}
