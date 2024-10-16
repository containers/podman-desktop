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

/**
 * Enumeration representing the kind of Kubernetes workload.
 */
export enum WorkloadKind {
  POD,
  DEPLOYMENT,
  SERVICE,
}

/**
 * Interface representing a port mapping configuration.
 */
export interface PortMapping {
  /**
   * The local port number.
   */
  localPort: number;

  /**
   * The remote port number.
   */
  remotePort: number;
}

/**
 * Interface representing the configuration for forwarding ports.
 * @see WorkloadKind
 * @see PortMapping
 */
export interface ForwardConfig {
  /**
   * The name of the resource.
   */
  name: string;

  /**
   * The namespace of the resource.
   */
  namespace: string;

  /**
   * The kind of the workload.
   */
  kind: WorkloadKind;

  /**
   * The list of port mappings.
   */
  forwards: PortMapping[];
}

/**
 * Interface representing a user-specific forward configuration.
 * Extends the base {@link ForwardConfig} interface.
 * @see ForwardConfig
 */
export interface UserForwardConfig extends ForwardConfig {
  /**
   * The display name for the forward configuration.
   */
  displayName: string;
}
