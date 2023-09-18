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

import type Dockerode from 'dockerode';

export interface ContainerPortInfo {
  IP: string;
  PrivatePort: number;
  PublicPort: number;
  Type: string;
}

export interface ContainerInfo {
  engineId: string;
  engineName: string;
  engineType: 'podman' | 'docker';
  StartedAt: string;
  pod?: {
    id: string;
    name: string;
    status: string;
    engineId: string;
  };
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command?: string;
  Created: number;
  Ports: ContainerPortInfo[];
  Labels: { [label: string]: string };
  State: string;
  Status?: string;
}

export interface SimpleContainerInfo extends Dockerode.ContainerInfo {
  engineId: string;
  engineName: string;
  engineType: 'podman' | 'docker';
}

export interface HostConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PortBindings?: any;
  Binds?: string[];
  AutoRemove?: boolean;
  SecurityOpt?: string[];
  Privileged?: boolean;
  ReadonlyRootfs?: boolean;
  CapAdd?: string[];
  CapDrop?: string[];
  UsernsMode?: string;
  RestartPolicy?: { Name: string; MaximumRetryCount?: number };
  Dns?: string[];
  ExtraHosts?: string[];
  NetworkMode?: string;
}

export interface ContainerCreateOptions {
  name?: string;
  Hostname?: string;
  User?: string;
  // Env using ["MYVAR=value", ...]
  Env?: string[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  ExposedPorts?: { [port: string]: {} };
  HostConfig?: HostConfig;
  Image?: string;
  Tty?: boolean;
  Cmd?: string[];
  Entrypoint?: string | string[];
  AttachStdin?: boolean;
  AttachStdout?: boolean;
  AttachStderr?: boolean;
  OpenStdin?: boolean;
  StdinOnce?: boolean;
  Detach?: boolean;
}

export interface VolumeCreateOptions {
  Name?: string;
}
