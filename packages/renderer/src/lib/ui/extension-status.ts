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

import { capitalize } from './Util';

export type ExtensionLifecycleState = 'installed' | 'disabled' | 'enabling' | 'disabling' | 'failed';

export type ExtensionStatusIcon = 'running' | 'stopped' | 'waiting' | 'terminated' | 'downloadable' | 'unknown';

export interface ExtensionStatusPresentation {
  icon: ExtensionStatusIcon;
  labelClass: string;
  label: string;
}

export class ExtensionStatusMapper {
  protected static readonly presentations: Readonly<Record<ExtensionLifecycleState, ExtensionStatusPresentation>> = {
    installed: {
      icon: 'running',
      labelClass: 'text-sm text-(--pd-status-running)',
      label: 'Installed',
    },
    disabled: {
      icon: 'stopped',
      labelClass: 'text-sm text-(--pd-status-stopped)',
      label: 'Disabled',
    },
    enabling: {
      icon: 'waiting',
      labelClass: 'text-sm text-(--pd-status-waiting)',
      label: 'Enabling',
    },
    disabling: {
      icon: 'waiting',
      labelClass: 'text-sm text-(--pd-status-waiting)',
      label: 'Disabling',
    },
    failed: {
      icon: 'terminated',
      labelClass: 'text-sm text-(--pd-status-terminated)',
      label: 'Failed',
    },
  };

  protected static readonly extensionStates: Readonly<Record<string, ExtensionLifecycleState>> = {
    started: 'installed',
    starting: 'enabling',
    stopped: 'disabled',
    stopping: 'disabling',
    failed: 'failed',
  };

  protected static readonly downloadablePresentation: ExtensionStatusPresentation = {
    icon: 'downloadable',
    labelClass: 'font-bold text-[9px] text-(--pd-status-ready)',
    label: 'DOWNLOADABLE',
  };

  public toLifecycleState(status: string): ExtensionLifecycleState | undefined {
    if (Object.hasOwn(ExtensionStatusMapper.extensionStates, status)) {
      return ExtensionStatusMapper.extensionStates[status];
    }
    return undefined;
  }

  public getPresentation(status: string): ExtensionStatusPresentation {
    const lifecycleState = this.toLifecycleState(status);
    if (lifecycleState) {
      return ExtensionStatusMapper.presentations[lifecycleState];
    }
    if (status === 'downloadable') {
      return ExtensionStatusMapper.downloadablePresentation;
    }
    return {
      icon: 'unknown',
      labelClass: 'font-bold text-[9px] text-(--pd-status-unknown)',
      label: capitalize(status),
    };
  }
}
