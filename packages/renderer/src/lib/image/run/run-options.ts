/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

export interface PortInfo {
  port: string;
  error: string;
}

export interface SecretMapping {
  name: string;
  type: 'mount' | 'env';
  target: string;
}

export interface RunOptions {
  basic: {
    containerName: string;
    entrypoint: string;
    command: string;
    volumeMounts: { sourceType: 'bind' | 'volume'; source: string; target: string }[];
    environmentVariables: { key: string; value: string }[];
    environmentFiles: string[];
    hostContainerPortMappings: { hostPort: PortInfo; containerPort: string }[];
    containerPortMapping: Array<PortInfo>;
    secretMappings: Array<SecretMapping>;
  };
  networking: {
    hostname?: string;
    dnsServers: string[];
    extraHosts: { host: string; ip: string }[];
    networkingMode: string;
    networkingModeUserNetwork: string;
    networkingModeUserContainer: string;
  };
  advanced: {
    useTty: boolean;
    useInteractive: boolean;
    runUser?: string;
    autoRemove: boolean;
    restartPolicyName: string;
    restartPolicyMaxRetryCount: number;
    devices: { host: string; container: string; read: boolean; write: boolean; mknod: boolean }[];
  };
  security: {
    privileged: boolean;
    readOnly: boolean;
    securityOpts: string[];
    capAdds: string[];
    capDrops: string[];
    userNamespace?: string;
  };
}
