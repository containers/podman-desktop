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

import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';
import type { ContainerGroupInfoUI, ContainerGroupPartInfoUI, ContainerInfoUI } from './ContainerInfoUI';
import { ContainerGroupInfoTypeUI } from './ContainerInfoUI';
import moment from 'moment';
import humanizeDuration from 'humanize-duration';
import { filesize } from 'filesize';
export class ContainerUtils {
  getName(containerInfo: ContainerInfo) {
    // part of a compose ?
    const composeService = (containerInfo.Labels || {})['com.docker.compose.service'];
    if (composeService) {
      const composeContainerNumber = (containerInfo.Labels || {})['com.docker.compose.container-number'];
      if (composeContainerNumber) {
        return `${composeService}-${composeContainerNumber}`;
      }
    }
    return containerInfo.Names[0].replace(/^\//, '');
  }

  getState(containerInfo: ContainerInfo): string {
    return (containerInfo.State || '').toUpperCase();
  }

  getUptime(containerInfo: ContainerInfo): string {
    if (containerInfo.State?.toUpperCase() !== 'RUNNING' || !containerInfo.StartedAt) {
      return '';
    }

    // make it human friendly
    return this.humanizeUptime(containerInfo.StartedAt);
  }

  humanizeUptime(started: string): string {
    // get start time in ms
    const uptimeInMs = moment().diff(started);
    // make it human friendly
    return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
  }

  refreshUptime(containerInfoUI: ContainerInfoUI): string {
    if (containerInfoUI.state !== 'RUNNING' || !containerInfoUI.startedAt) {
      return '';
    }
    // make it human friendly
    return this.humanizeUptime(containerInfoUI.startedAt);
  }

  getImage(containerInfo: ContainerInfo): string {
    return containerInfo.Image;
  }

  getPort(containerInfo: ContainerInfo): string {
    const ports = containerInfo.Ports?.filter(port => port.PublicPort).map(port => port.PublicPort);

    if (ports && ports.length > 1) {
      return ports.join(', ');
    } else if (ports && ports.length === 1) {
      return `${ports[0]}`;
    } else {
      return '';
    }
  }

  getDisplayPort(containerInfo: ContainerInfo): string {
    const ports = this.getPort(containerInfo);
    if (ports === '') {
      return '';
    }
    return `PORT${ports.indexOf(',') > 0 ? 'S' : ''} ${ports}`;
  }

  hasPublicPort(containerInfo: ContainerInfo): boolean {
    const publicPorts = containerInfo.Ports?.filter(port => port.PublicPort).map(port => port.PublicPort);

    return publicPorts.length > 0;
  }

  getOpeningUrl(containerInfo: ContainerInfo): string {
    const ports = containerInfo.Ports?.filter(port => port.PublicPort).map(port => port.PublicPort);
    if (ports && ports.length > 0) {
      return `http://localhost:${ports[0]}`;
    } else {
      return '';
    }
  }

  getEngineId(containerInfo: ContainerInfo): string {
    return containerInfo.engineId;
  }

  getEngineName(containerInfo: ContainerInfo): string {
    return containerInfo.engineName;
  }

  getContainerInfoUI(containerInfo: ContainerInfo): ContainerInfoUI {
    return {
      id: containerInfo.Id,
      shortId: containerInfo.Id.substring(0, 8),
      name: this.getName(containerInfo),
      image: this.getImage(containerInfo),
      state: this.getState(containerInfo),
      startedAt: containerInfo.StartedAt,
      uptime: this.getUptime(containerInfo),
      engineId: this.getEngineId(containerInfo),
      engineName: this.getEngineName(containerInfo),
      engineType: containerInfo.engineType,
      command: containerInfo.Command,
      port: this.getPort(containerInfo),
      displayPort: this.getDisplayPort(containerInfo),
      hasPublicPort: this.hasPublicPort(containerInfo),
      openingUrl: this.getOpeningUrl(containerInfo),
      groupInfo: this.getContainerGroup(containerInfo),
      selected: false,
      created: containerInfo.Created,
    };
  }

  getContainerGroup(containerInfo: ContainerInfo): ContainerGroupPartInfoUI {
    // compose metatadata ?
    const composeProject = (containerInfo.Labels || {})['com.docker.compose.project'];
    if (composeProject) {
      return {
        name: composeProject,
        type: ContainerGroupInfoTypeUI.COMPOSE,
      };
    }

    // pod ?
    const podInfo = containerInfo.pod;
    if (podInfo) {
      return {
        name: podInfo.name,
        type: ContainerGroupInfoTypeUI.POD,
        id: podInfo.id,
        engineId: containerInfo.engineId,
      };
    }

    // else, standalone
    return {
      name: this.getName(containerInfo),
      type: ContainerGroupInfoTypeUI.STANDALONE,
    };
  }

  getContainerGroups(containerInfos: ContainerInfoUI[]): ContainerGroupInfoUI[] {
    // create a map from containers having the same group field
    const groups = new Map<string, ContainerGroupInfoUI>();
    containerInfos.forEach(containerInfo => {
      const group = containerInfo.groupInfo;
      if (group.type === ContainerGroupInfoTypeUI.STANDALONE) {
        // standalone group, insert with id as key
        groups.set(containerInfo.id, { ...group, containers: [containerInfo], expanded: true, selected: false });
      } else {
        if (!groups.has(group.name)) {
          groups.set(group.name, {
            selected: false,
            expanded: true,
            name: group.name,
            type: group.type,
            id: group.id,
            engineId: group.engineId,
            containers: [],
          });
        }
        groups.get(group.name).containers.push(containerInfo);
      }
    });
    return Array.from(groups.values());
  }

  getMemoryPercentageUsageTitle(memoryUsagePercentage: number, usedMemory: number): string {
    return `${memoryUsagePercentage.toFixed(2)}% (${filesize(usedMemory)})`;
  }

  getMemoryUsageTitle(usedMemory: number): string {
    return `${filesize(usedMemory)}`;
  }
}
