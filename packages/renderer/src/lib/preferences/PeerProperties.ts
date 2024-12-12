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

import type { IProviderConnectionConfigurationPropertyRecorded } from './Util';

export class PeerProperties {
  private peerProperties: string[];
  constructor(readonly suffix: string = 'Usage') {
    this.peerProperties = [];
  }

  public isPeerProperty(id?: string): boolean {
    return this.peerProperties.some(value => value === id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getPeerProperty(id: string | undefined, properties: IProviderConnectionConfigurationPropertyRecorded[]): any {
    if (id) {
      const peerId = id + this.suffix;
      const peerProperty = properties.find(property => property.id === peerId);
      if (peerProperty?.id) {
        this.peerProperties.push(peerProperty.id);
        return peerProperty.value;
      }
    }
    return '';
  }
}
