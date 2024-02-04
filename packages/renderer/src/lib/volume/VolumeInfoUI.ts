/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

export interface VolumeInfoUI {
  name: string;
  shortName: string;
  mountPoint: string;
  scope: string;
  driver: string;
  created: string;
  age: string;
  size: number;
  humanSize: string;
  engineId: string;
  engineName: string;
  selected: boolean;
  status: 'USED' | 'UNUSED' | 'DELETING';
  containersUsage: { id: string; names: string[] }[];
}
