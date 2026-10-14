/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
import type { CheckResult, TelemetryLogger } from '@podman-desktop/api';
import { env } from '@podman-desktop/api';
import { inject, injectable } from 'inversify';

import { MemoizedBaseCheck } from '/@/checks/memoized-base-check';
import { TelemetryLoggerSymbol } from '/@/inject/symbols';
import { getPowerShellClient } from '/@/utils/powershell';

@injectable()
export class PodmanDesktopElevatedCheck extends MemoizedBaseCheck {
  title = `${env.appName} Elevated`;

  constructor(
    @inject(TelemetryLoggerSymbol)
    private telemetryLogger: TelemetryLogger,
  ) {
    super();
  }

  async executeImpl(): Promise<CheckResult> {
    const client = await getPowerShellClient(this.telemetryLogger);
    if (!(await client.isRunningElevated())) {
      return this.createFailureResult({
        description: `You must run ${env.appName} with administrative rights to install and configure Podman with Hyper-V support.`,
      });
    }
    return this.createSuccessfulResult();
  }
}
