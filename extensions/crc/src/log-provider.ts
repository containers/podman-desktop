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

import type { Logger } from '@podman-desktop/api';
import type { DaemonCommander } from './daemon-commander';

export class LogProvider {
  private timeout: NodeJS.Timeout;
  constructor(private readonly commander: DaemonCommander) {}

  async startSendingLogs(logger: Logger): Promise<void> {
    let lastLogLine = 0;
    this.timeout = setInterval(async () => {
      try {
        const logs = await this.commander.logs();
        const logsDiff: string[] = logs.Messages.slice(lastLogLine, logs.Messages.length - 1);
        lastLogLine = logs.Messages.length;
        logger.log(logsDiff.join('\n'));
      } catch (e) {
        console.log('Logs tick: ' + e);
      }
    }, 3000);
  }

  stopSendingLogs(): void {
    clearInterval(this.timeout);
  }
}
