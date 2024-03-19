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

type MountType = 'bind' | 'volume' | 'tmpfs';

type MountConsistency = 'default' | 'consistent' | 'cached' | 'delegated';

type MountPropagation = 'private' | 'rprivate' | 'shared' | 'rshared' | 'slave' | 'rslave';

interface MountSettings {
  Target: string;
  Source: string;
  Type: MountType;
  ReadOnly?: boolean;
  Consistency?: MountConsistency;
  Mode?: string;
  BindOptions?: {
    Propagation: MountPropagation;
  };
  VolumeOptions?: {
    NoCopy: boolean;
    Labels: { [label: string]: string };
    DriverConfig: {
      Name: string;
      Options: { [option: string]: string };
    };
  };
  TmpfsOptions?: {
    SizeBytes: number;
    Mode: number;
  };
}

type MountConfig = MountSettings[];

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
  Mounts?: MountConfig;
}

export interface HealthConfig {
  /**
   * The test to perform. Possible values are:
   *
   * - ```[]``` inherit healthcheck from image or parent image
   * - ```["NONE"]``` disable healthcheck
   * - ```["CMD", args...]``` exec arguments directly
   * - ```["CMD-SHELL", command]``` run command with system's default shell
   */
  Test?: string[];

  /**
   * The time to wait between checks in nanoseconds. It should be 0 or at least 1000000 (1 ms). 0 means inherit.
   */
  Interval?: number;

  /**
   * The time to wait before considering the check to have hung. It should be 0 or at least 1000000 (1 ms). 0 means inherit.
   */
  Timeout?: number;

  /**
   * Start period for the container to initialize before starting health-retries countdown in nanoseconds. It should
   * be 0 or at least 1000000 (1 ms). 0 means inherit.
   */
  StartPeriod?: number;

  /**
   * The number of consecutive failures needed to consider a container as unhealthy. 0 means inherit.
   */
  Retries?: number;
}

interface EndpointIPAMConfig {
  IPv4Address?: string;
  IPv6Address?: string;
  LinkLocalIPs?: string[];
}

interface EndpointSettings {
  /**
   * EndpointIPAMConfig represents an endpoint's IPAM configuration.
   */
  IPAMConfig?: EndpointIPAMConfig;

  Links?: string[];

  /**
   * MAC address for the endpoint on this network. The network driver might ignore this parameter.
   */
  MacAddress?: string;

  Aliases?: string[];

  /**
   * Unique ID of the network.
   */
  NetworkID?: string;

  /**
   * Unique ID for the service endpoint in a Sandbox.
   */
  EndpointID?: string;

  /**
   * Gateway address for this network.
   */
  Gateway?: string;

  /**
   * IPv4 address.
   */
  IPAddress?: string;

  /**
   * Mask length of the IPv4 address.
   */
  IPPrefixLen?: number;

  /**
   * IPv6 gateway address.
   */
  IPv6Gateway?: string;

  /**
   * Global IPv6 address.
   */
  GlobalIPv6Address?: string;

  /**
   * Mask length of the global IPv6 address.
   */
  GlobalIPv6PrefixLen?: number;

  /**
   * DriverOpts is a mapping of driver options and values. These options are passed directly to the driver and are driver specific.
   */
  DriverOpts?: { [key: string]: string };

  /**
   * List of all DNS names an endpoint has on a specific network. This list is based on the container name, network
   * aliases, container short ID, and hostname.
   *
   * These DNS names are non-fully qualified but can contain several dots. You can get fully qualified DNS names by
   * appending ```.<network-name>```. For instance, if container name is ```my.ctr``` and the network is named
   * ```testnet```, ```DNSNames``` will contain ```my.ctr``` and the FQDN will be ```my.ctr.testnet```.
   */
  DNSNames?: string[];
}

export interface NetworkingConfig {
  EndpointsConfig?: { [key: string]: EndpointSettings };
}

export interface ContainerCreateOptions {
  name?: string;
  platform?: string;
  Hostname?: string;
  User?: string;
  Domainname?: string;
  // Env using ["MYVAR=value", ...]
  Env?: string[];

  // environment files to use
  EnvFiles?: string[];
  Labels?: { [label: string]: string };

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
  start?: boolean;
  HealthCheck?: HealthConfig;
  ArgsEscaped?: boolean;
  Volumes?: { [volume: string]: object };
  WorkingDir?: string;
  NetworkDisabled?: boolean;
  MacAddress?: string;
  OnBuild?: string[];
  StopSignal?: string;
  StopTimeout?: number;
  Shell?: string[];
  NetworkConfig?: NetworkingConfig;
  pod?: string;
}

export interface NetworkCreateOptions {
  Name: string;
}

export interface NetworkCreateResult {
  Id: string;
}

export interface VolumeCreateOptions {
  Name?: string;
}

export interface VolumeCreateResponseInfo extends Dockerode.VolumeCreateResponse {}

export interface ContainerExportOptions {
  id: string;
  name: string;
  outputDirectory: string;
}
