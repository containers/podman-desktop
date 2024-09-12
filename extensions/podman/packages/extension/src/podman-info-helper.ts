/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import * as extensionApi from '@podman-desktop/api';

/**
 * Enhance records with some data found in podman info command
 */
export class PodmanInfoHelper {
  async updateWithPodmanInfoRecords(records: Record<string, unknown>): Promise<void> {
    try {
      const { stdout } = await extensionApi.process.exec('podman', ['info', '--format', 'json']);

      // try to parse the JSON
      const podmanInfo = JSON.parse(stdout);
      records.podmanMachineArch = podmanInfo.host?.arch;
      records.podmanMachineBuildahVersion = podmanInfo.host?.buildahVersion;
      records.podmanMachineConmonVersion = podmanInfo.host?.conmon?.version;
      records.podmanMachineCpus = podmanInfo.host?.cpus;
      records.podmanMachineDatabaseBackend = podmanInfo.host?.databaseBackend;
      records.podmanMachineDistribution = podmanInfo.host?.distribution;
      records.podmanMachineKernel = podmanInfo.host?.kernel;
      records.podmanMachineMemFree = podmanInfo.host?.memFree;
      records.podmanMachineMemTotal = podmanInfo.host?.memTotal;
      records.podmanMachineNetworkBackend = podmanInfo.host?.networkBackend;
      records.podmanMachineNetworkBackendVersion = podmanInfo.host?.networkBackendInfo?.version;
      records.podmanMachineNetworkOciRuntime = podmanInfo.host?.ociRuntime;
      records.podmanMachineVersion = podmanInfo.version?.Version;
      records.podmanMachineVersionBuiltTime = podmanInfo.version?.BuiltTime;
      records.podmanMachineVersionGo = podmanInfo.version?.GoVersion;
      records.podmanMachineOsArch = podmanInfo.version?.OsArch;
    } catch (error) {
      records.errorPodmanMachineInfo = true;
      records.errorPodmanMachineInfoMessage = (error as extensionApi.RunError)?.message;
    }
  }
}
