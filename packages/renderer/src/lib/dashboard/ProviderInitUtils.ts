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
import { faPlay, faWrench } from '@fortawesome/free-solid-svg-icons';
import type { ProviderDetectionCheck } from '@podman-desktop/api';
import Fa from 'svelte-fa';

export const DoNothingMode = 'Do nothing';
export const InitializeOnlyMode = 'Initialize';
export const InitializeAndStartMode = 'Initialize and start';

export type InitializationMode = typeof DoNothingMode | typeof InitializeOnlyMode | typeof InitializeAndStartMode;

export interface InitializationContext {
  mode: InitializationMode;
  promise?: Promise<ProviderDetectionCheck[]>;
  error?: string;
}

export const InitializationSteps = [
  { icon: Fa, iconProps: { icon: faWrench } },
  { icon: Fa, iconProps: { icon: faPlay } },
];
