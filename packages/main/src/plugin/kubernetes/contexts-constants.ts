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

// set this value as the (reasonably) maximum time a connection can get to be established
// or the reachable status of an unreachable context will flash as reachable during the connection attempt
export const connectTimeout = 1000;
// initial delay between two connection attempts
export const backoffInitialValue = 1000;
// maximum delay between two connection attempts
export const backoffLimit = 60_000;
// jitter to add to the delay between two connection attempts
export const backoffJitter = 300;
// the time to wait for any update on the data to dispatch before to send it
export const dispatchTimeout = 100;
