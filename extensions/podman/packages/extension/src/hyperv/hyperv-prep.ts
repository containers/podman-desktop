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

import { inject, injectable } from 'inversify';
import { gte, valid } from 'semver';

import { PodmanBinary } from '/@/utils/podman-binary';
import { execPodman } from '/@/utils/util';

export enum HyperVPrepStatus {
  NOT_APPLIED = 'notApplied',
  APPLIED = 'applied',
}

@injectable()
export class HyperVPrep {
  private static readonly PODMAN_MINIMUM_VERSION = '6.0.0';
  private static readonly MEMBERSHIP_HEADER = 'hyper-v administrators group membership:';

  @inject(PodmanBinary)
  private readonly podmanBinary!: PodmanBinary;

  async isSupported(): Promise<boolean> {
    const binaryInfo = await this.podmanBinary.getBinaryInfo();
    if (!binaryInfo) {
      return false;
    }

    const version = valid(binaryInfo.version);
    return version !== null && gte(version, HyperVPrep.PODMAN_MINIMUM_VERSION);
  }

  async getStatus(): Promise<HyperVPrepStatus> {
    const result = await execPodman(['system', 'hyperv-prep', '--status']);
    return this.parseStatus(result.stdout);
  }

  /**
   * Parses output from `podman system hyperv-prep --status`, for example:
   * ```text
   * Hyper-V vsock registry entries:
   *   No vsock registry entries found.
   * Hyper-V Administrators group membership:
   *   Current user is NOT a member
   * ```
   */
  protected parseStatus(stdout: string): HyperVPrepStatus {
    const lines = stdout.split(/\r?\n/).map(line => line.trim());
    const membershipHeaderIndex = lines.findIndex(line => line.toLowerCase() === HyperVPrep.MEMBERSHIP_HEADER);
    const membership =
      membershipHeaderIndex === -1 ? undefined : lines.slice(membershipHeaderIndex + 1).find(line => line.length > 0);
    const isGroupMember = membership?.toLowerCase() === 'current user is a member';

    return isGroupMember ? HyperVPrepStatus.APPLIED : HyperVPrepStatus.NOT_APPLIED;
  }
}
