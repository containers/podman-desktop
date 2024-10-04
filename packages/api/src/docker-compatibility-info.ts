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

export enum ExperimentalSettings {
  SectionName = 'dockerCompatibility',
  Enabled = 'enabled',
}

export type DockerSocketServerInfoType = 'podman' | 'docker' | 'unknown';

export interface DockerSocketMappingStatusInfo {
  status: 'running' | 'unreachable';
  connectionInfo?: {
    provider: {
      id: string;
      name: string;
    };
    link: string;
    name: string;
    displayName: string;
  };
  serverInfo?: {
    type: DockerSocketServerInfoType;
    serverVersion: string;
    operatingSystem: string;
    osType: string;
    architecture: string;
  };
}

// handle the context information of the docker contexts
// https://docs.docker.com/engine/manage-resources/contexts/
export interface DockerContextInfo {
  name: string;
  isCurrentContext: boolean;
  metadata: {
    description: string;
  };
  endpoints: {
    docker: {
      host: string;
    };
  };
}
