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
import type { ContainerInfoUI } from './ContainerInfoUI';
import moment from 'moment';
import * as humanize from 'humanize-duration';
export class ContainerUtils {
  getName(containerInfo: ContainerInfo) {
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
    return `${this.humanizeUptime(containerInfo.StartedAt)} ago`;
  }

  humanizeUptime(started: string): string {
    // get start time in ms
    const uptimeInMs = moment().diff(started);
    // make it human friendly
    return humanize(uptimeInMs, { round: true, largest: 1 });
  }

  refreshUptime(containerInfoUI: ContainerInfoUI): string {
    if (containerInfoUI.state !== 'RUNNING' || !containerInfoUI.startedAt) {
      return '';
    }
    // make it human friendly
    return `${this.humanizeUptime(containerInfoUI.startedAt)} ago`;
  }

  getImage(containerInfo: ContainerInfo): string {
    return containerInfo.Image;
  }

  getPort(containerInfo: ContainerInfo): string {
    const ports = containerInfo.Ports?.filter(port => port.PublicPort).map(port => port.PublicPort);

    if (ports && ports.length > 1) {
      return `PORTS: ${ports.join(', ')}`;
    } else if (ports && ports.length === 1) {
      return `PORT: ${ports[0]}`;
    } else {
      return '';
    }
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
      command: containerInfo.Command,
      port: this.getPort(containerInfo),
      hasPublicPort: this.hasPublicPort(containerInfo),
      openingUrl: this.getOpeningUrl(containerInfo),
    };
  }
}
