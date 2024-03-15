/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import { filesize } from 'filesize';
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

import type { VolumeInfo } from '../../../../main/src/plugin/api/volume-info';
import type { VolumeInfoUI } from './VolumeInfoUI';

export class VolumeUtils {
  getShortName(volumeInfo: VolumeInfo): string {
    // check if the name is 64 characters long and contains only hexa characters
    if (volumeInfo.Name.length === 64 && /^[0-9a-f]+$/.test(volumeInfo.Name)) {
      return volumeInfo.Name.substring(0, 12);
    }
    return volumeInfo.Name;
  }

  humanizeAge(started: string): string {
    // get start time in ms
    const uptimeInMs = moment().diff(started);
    // make it human friendly
    return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
  }

  getSize(volumeInfo: VolumeInfo): string {
    // handle missing case
    if (volumeInfo.UsageData?.Size === -1) {
      return 'N/A';
    }
    if (volumeInfo.UsageData?.Size) {
      return `${filesize(volumeInfo.UsageData?.Size, { roundingMethod: 'round' })}`;
    }
    return '0 B';
  }

  refreshAge(volumeInfoUI: VolumeInfoUI): string {
    if (!volumeInfoUI.created) {
      return '';
    }
    // make it human friendly
    return this.humanizeAge(volumeInfoUI.created);
  }

  getDriver(volumeInfo: VolumeInfo): string {
    return volumeInfo.Driver;
  }

  toVolumeInfoUI(volumeInfo: VolumeInfo): VolumeInfoUI {
    return {
      name: volumeInfo.Name,
      shortName: this.getShortName(volumeInfo),
      mountPoint: volumeInfo.Mountpoint,
      scope: volumeInfo.Scope,
      driver: this.getDriver(volumeInfo),
      created: volumeInfo.CreatedAt,
      age: this.humanizeAge(volumeInfo.CreatedAt),
      size: volumeInfo.UsageData ? volumeInfo.UsageData?.Size : -1,
      humanSize: this.getSize(volumeInfo),
      engineId: volumeInfo.engineId,
      engineName: volumeInfo.engineName,
      selected: false,
      status: (volumeInfo.UsageData?.RefCount || 0) > 0 ? 'USED' : 'UNUSED',
      containersUsage: volumeInfo.containersUsage,
    };
  }
}
