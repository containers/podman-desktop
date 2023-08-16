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

import type {
  PodInfo as LibPodPodInfo,
  PodInspectInfo as LibPodPodInspectInfo,
} from '../dockerode/libpod-dockerode.js';

export interface PodInfo extends LibPodPodInfo {
  engineId: string;
  engineName: string;
  kind: 'kubernetes' | 'podman';
}

export interface PodInspectInfo extends LibPodPodInspectInfo {
  engineId: string;
  engineName: string;
}
