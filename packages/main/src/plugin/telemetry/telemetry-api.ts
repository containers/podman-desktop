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

/**
 * Frequency of collection:
 *  dailyPerInstance - log the first time the event happens after startup.
 *
 * Enum to allow for future expansion, e.g. 'daily' or 'weekly'.
 */
export type Frequency = 'dailyPerInstance';

export interface TelemetryRule {
  // regex matching telemetry event
  event: string;
  // ratio to send events, e.g. 0.5
  ratio?: number;
  // disable this event entirely
  disabled?: boolean;
  // control the frequency of sending events
  frequency?: Frequency;
}
