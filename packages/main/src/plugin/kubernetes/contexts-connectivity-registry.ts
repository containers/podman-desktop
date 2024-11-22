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

export interface ContextConnectivity {
  // Is the connectivity being checked?
  checking: boolean;
  // Is cluster of the context reachable?
  reachable: boolean;
}

export class ContextsConnectivityRegistry {
  // ContextConnectivity indexed by contextName
  #connectivities: Map<string, ContextConnectivity>;

  constructor() {
    this.#connectivities = new Map();
  }

  // setChecking saves in the registry if the context `contextName` is being checked
  setChecking(contextName: string, checking: boolean): void {
    const connectivity = this.getConnectivity(contextName);
    connectivity.checking = checking;
    this.#connectivities.set(contextName, connectivity);
  }

  // setReachable saves in the registry if the context `contextName` is reachable
  setReachable(contextName: string, reachable: boolean): void {
    const connectivity = this.getConnectivity(contextName);
    connectivity.reachable = reachable;
    this.#connectivities.set(contextName, connectivity);
  }

  protected getConnectivity(contextName: string): ContextConnectivity {
    return this.#connectivities.get(contextName) ?? { checking: false, reachable: false };
  }
}
