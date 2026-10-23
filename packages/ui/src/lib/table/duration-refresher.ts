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

/**
 * Calls a callback with the current time, now and then, so that a duration
 * computed from a start time stays up to date without refreshing more often than needed.
 */
export class DurationRefresher {
  protected static readonly SECOND = 1000;
  protected static readonly MINUTE = DurationRefresher.SECOND * 60;
  protected static readonly HOUR = DurationRefresher.MINUTE * 60;
  protected static readonly DAY = DurationRefresher.HOUR * 24;

  #timeout: number | undefined;

  /**
   * Calls onTick each time the displayed duration changes.
   * Starting again replaces the previous schedule.
   *
   * @param startedAt the start time, in milliseconds since the epoch
   * @param onTick called with the current time, in milliseconds since the epoch
   */
  start(startedAt: number, onTick: (now: number) => void): void {
    this.stop();
    const tick = (): void => {
      const now = Date.now();
      this.#timeout = setTimeout(tick, this.computeInterval(now - startedAt));
      onTick(now);
    };
    this.#timeout = setTimeout(tick, this.computeInterval(Date.now() - startedAt));
  }

  stop(): void {
    if (this.#timeout !== undefined) {
      clearTimeout(this.#timeout);
      this.#timeout = undefined;
    }
  }

  /**
   * Computes how long to wait before a displayed duration needs to be refreshed.
   *
   * @param uptimeInMs the elapsed time, in milliseconds
   * @returns the delay, in milliseconds, before the next refresh
   */
  protected computeInterval(uptimeInMs: number): number {
    // if less than a minute, refresh every 2s
    if (uptimeInMs < DurationRefresher.MINUTE - 2 * DurationRefresher.SECOND) {
      return 2 * DurationRefresher.SECOND;
    }

    // if less than an hour, refresh on the next minute
    if (uptimeInMs < DurationRefresher.HOUR) {
      return Math.ceil((uptimeInMs + 1) / DurationRefresher.MINUTE) * DurationRefresher.MINUTE - uptimeInMs;
    }

    // if less than a day, refresh on the next hour
    if (uptimeInMs < DurationRefresher.DAY) {
      return Math.ceil((uptimeInMs + 1) / DurationRefresher.HOUR) * DurationRefresher.HOUR - uptimeInMs;
    }

    // otherwise, refresh on the next day
    return Math.ceil((uptimeInMs + 1) / DurationRefresher.DAY) * DurationRefresher.DAY - uptimeInMs;
  }
}
