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

import type * as Dockerode from 'dockerode';

export interface VolumeInfo extends Dockerode.VolumeInspectInfo {
  engineId: string;
  engineName: string;
  CreatedAt: string;
  containersUsage: { id: string; names: string[] }[];
}

export interface VolumeInspectInfo extends Dockerode.VolumeInspectInfo {
  engineId: string;
  engineName: string;
}

export interface VolumeListInfo {
  Volumes: VolumeInfo[];
  Warnings: string[];
  engineId: string;
  engineName: string;
}
