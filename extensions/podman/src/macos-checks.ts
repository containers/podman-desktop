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

import { BaseCheck } from './base-check';
import type * as extensionApi from '@tmpwip/extension-api';
import * as os from 'node:os';
import * as compareVersions from 'compare-versions';

export class MacCPUCheck extends BaseCheck {
  title = 'CPU';
  private readonly MIN_CPU_NUMBER = 2;
  async execute(): Promise<extensionApi.CheckResult> {
    const cpus = os.cpus();
    if (cpus.length < this.MIN_CPU_NUMBER) {
      return this.createFailureResult(`You need to have at least ${this.MIN_CPU_NUMBER} CPU cores to run podman.`);
    }

    return this.createSuccessfulResult();
  }
}

export class MacMemoryCheck extends BaseCheck {
  title = 'RAM';
  private readonly REQUIRED_MEM = 4 * 1024 * 1024 * 1024; // 4Gb

  async execute(): Promise<extensionApi.CheckResult> {
    const totalMem = os.totalmem();
    if (this.REQUIRED_MEM <= totalMem) {
      return this.createSuccessfulResult();
    } else {
      return this.createFailureResult('You need at least 4GB to run Podman.');
    }
  }
}

export class MacVersionCheck extends BaseCheck {
  title = 'macOS Version';
  private readonly MINIMUM_VERSION = '19.0.0'; // first macOS Catalina kernel version

  async execute(): Promise<extensionApi.CheckResult> {
    const darwinVersion = os.release();
    if (compareVersions.compare(darwinVersion, this.MINIMUM_VERSION, '>=')) {
      return this.createSuccessfulResult();
    }

    return this.createFailureResult('To be able to run podman you need to update to macOS Catalina.');
  }
}
