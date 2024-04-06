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
import * as extensionApi from '@podman-desktop/api';

export const DEFAULT_MONITOR_INTERVAL_MS = 5000;

export type StopLoopPredicate = () => boolean;

export class Monitor {
  private readonly stopLoopPredicate: StopLoopPredicate;
  private readonly intervalMs: number = 5000;
  private readonly name: string;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly fn: () => Promise<any>,
    options: {
      name: string;
      stopMonitorPredicate: StopLoopPredicate;
      intervalMs?: number;
    },
  ) {
    this.stopLoopPredicate = options.stopMonitorPredicate;
    this.intervalMs = options.intervalMs ?? DEFAULT_MONITOR_INTERVAL_MS;
    this.name = options.name;
  }

  // Start monitoring by calling passed in constructor parameters function until stopLoopPredicate returns false
  start(): void {
    const loop = (): NodeJS.Timeout =>
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(async (): Promise<void> => {
        if (this.stopLoopPredicate()) {
          return undefined;
        }

        try {
          await this.fn();
        } catch (err: unknown) {
          console.error(`Error while monitoring ${this.name}`, err);
          if (err instanceof Error) {
            extensionApi.env.createTelemetryLogger().logError(err);
          } else {
            extensionApi.env.createTelemetryLogger().logError(err.toString());
          }
        }

        loop();
      }, this.intervalMs);
    loop();
  }
}
