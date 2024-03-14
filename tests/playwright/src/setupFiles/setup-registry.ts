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

export function setupRegistry(): string[] {
  const urlDefault = process.env.CI ? 'ghcr.io' : '';
  const registryUrl = process.env.REGISTRY_URL ? process.env.REGISTRY_URL : urlDefault;
  const ciDefault = process.env.CI ? 'podmandesktop-ci' : '';
  const registryUsername = process.env.REGISTRY_USERNAME ? process.env.REGISTRY_USERNAME : ciDefault;
  const tokenDef = process.env.PODMANDESKTOP_CI_BOT_TOKEN ? process.env.PODMANDESKTOP_CI_BOT_TOKEN : '';
  const pwsdDefault = process.env.CI ? tokenDef : '';
  const registryPswdSecret = process.env.REGISTRY_PASSWD ? process.env.REGISTRY_PASSWD : pwsdDefault;
  return [registryUrl, registryUsername, registryPswdSecret];
}

export function canTestRegistry(): boolean {
  const [registry, username, passwd] = setupRegistry();
  return !!(registry && registry !== '' && username && username !== '' && passwd && passwd !== '');
}
