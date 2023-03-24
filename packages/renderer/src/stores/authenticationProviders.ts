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

import type * as containerDesktopAPI from '@podman-desktop/api';
import { derived, readable, Readable, Writable, writable } from 'svelte/store';

export async function fetchAuthenicationProvidersInfo() {
  // here we have to rebuld authentication providers with sessinons 
  // which are not included
  const authProvidersInfo = await window.getAuthenticationProvidersInfo();
  authenticationProviders.set(authProvidersInfo);
}


export const authenticationProviders: Writable<readonly containerDesktopAPI.AuthenticationProviderInfo[]> = writable([]);

// need to refresh when new registry are updated/deleted
window.events?.receive('authentication-provider-register', fetchAuthenicationProvidersInfo);
window.events?.receive('authentication-provider-unregister', fetchAuthenicationProvidersInfo);
window.events?.receive('authentication-provider-update', fetchAuthenicationProvidersInfo);
window.addEventListener('system-ready', fetchAuthenicationProvidersInfo);