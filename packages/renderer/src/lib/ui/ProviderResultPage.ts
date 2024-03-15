/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { ImageCheck } from '@podman-desktop/api';

import type { ImageCheckerInfo } from '../../../../main/src/plugin/api/image-checker-info';

export interface ProviderUI {
  info: ImageCheckerInfo;
  state: 'running' | 'success' | 'failed' | 'canceled';
  error?: Error;
}

export interface CheckUI {
  provider: ImageCheckerInfo;
  check: ImageCheck;
}
