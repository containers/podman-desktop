/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { NetworkInspectInfo } from '@desktop-framework/api';
import { NavigationPage } from '@desktop-framework/api';

import { handleNavigation } from '/@/navigation';

import type { NetworkContainer, NetworkInfoUI } from './NetworkInfoUI';

export class NetworkUtils {
  toNetworkInfoUI(networkInspectInfo: NetworkInspectInfo): NetworkInfoUI {
    return {
      id: networkInspectInfo.Id,
      shortId: networkInspectInfo.Id.substring(0, 12),
      name: networkInspectInfo.Name,
      driver: networkInspectInfo.Driver,
      created: networkInspectInfo.Created,
      engineId: networkInspectInfo.engineId,
      engineName: networkInspectInfo.engineName,
      engineType: networkInspectInfo.engineType,
      selected: false,
      status: Object.keys(networkInspectInfo.Containers ?? {}).length > 0 ? 'USED' : 'UNUSED',
      containers: this.getNetworkContainers(networkInspectInfo),
      ipv6_enabled: networkInspectInfo.EnableIPv6,
      labels: networkInspectInfo.Labels,
      options: networkInspectInfo.Options,
      subnets: networkInspectInfo.IPAM?.Config?.flatMap(config => config.Subnet ?? []),
    };
  }

  getNetworkContainers(networkInspectInfo: NetworkInspectInfo): NetworkContainer[] {
    if (networkInspectInfo.Containers) {
      return Object.keys(networkInspectInfo.Containers).map(containerId => {
        return { name: networkInspectInfo.Containers?.[containerId].Name ?? '', id: containerId };
      });
    } else {
      return [];
    }
  }
}

export function openDetailsNetwork(network: NetworkInfoUI): void {
  handleNavigation({ page: NavigationPage.NETWORK, parameters: { name: network.name, engineId: network.engineId } });
}
