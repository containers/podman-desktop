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

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { DurationRefresher } from './duration-refresher';

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
});

class TestDurationRefresher extends DurationRefresher {
  getComputeInterval(uptimeInMs: number): number {
    return this.computeInterval(uptimeInMs);
  }
}

describe('computeInterval', () => {
  test.each([
    // less than a minute: every 2s
    [500, 2000],
    [53_400, 2000],
    // 59.999s: refresh in 1ms
    [59_999, 1],
    // 1m: refresh in 1m
    [60_000, 60_000],
    // 1m1s: refresh in 59s
    [61_000, 59_000],
    // 1m29s: refresh in 31s (at 2m)
    [89_000, 31_000],
    // 1h: refresh in 1h
    [3_600_000, 3_600_000],
    // 3h25m: refresh in 35m (at 4h)
    [12_300_000, 2_100_000],
    // 1d: refresh in 1d
    [86_400_000, 86_400_000],
    // 1d1m: refresh in 1d minus 1m
    [86_460_000, 86_340_000],
  ])('returns the delay for %i ms of uptime', (uptime, expected) => {
    expect(new TestDurationRefresher().getComputeInterval(uptime)).toBe(expected);
  });
});

describe('DurationRefresher', () => {
  test('notifies when the displayed duration changes', () => {
    const onTick = vi.fn<(now: number) => void>();

    new DurationRefresher().start(Date.now(), onTick);
    expect(onTick).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2000);

    expect(onTick).toHaveBeenCalledOnce();
    expect(onTick).toHaveBeenCalledWith(Date.now());
  });

  test('refreshes every 2 seconds during the first minute', () => {
    const onTick = vi.fn<(now: number) => void>();

    new DurationRefresher().start(Date.now(), onTick);
    vi.advanceTimersByTime(4000);

    expect(onTick).toHaveBeenCalledTimes(2);
  });

  test('waits for the next minute once past the first minute', () => {
    const onTick = vi.fn<(now: number) => void>();

    // started 1m30s ago: the next refresh is due at 2m, in 30s
    new DurationRefresher().start(Date.now() - 90_000, onTick);
    vi.advanceTimersByTime(29_999);
    expect(onTick).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onTick).toHaveBeenCalledOnce();
  });

  test('stops refreshing after stop', () => {
    const onTick = vi.fn<(now: number) => void>();
    const refresher = new DurationRefresher();

    refresher.start(Date.now(), onTick);
    refresher.stop();
    vi.advanceTimersByTime(10_000);

    expect(onTick).not.toHaveBeenCalled();
  });

  test('starting again replaces the previous schedule', () => {
    const onTick = vi.fn<(now: number) => void>();
    const refresher = new DurationRefresher();

    refresher.start(Date.now(), onTick);
    refresher.start(Date.now(), onTick);
    vi.advanceTimersByTime(2000);

    expect(onTick).toHaveBeenCalledOnce();
  });

  test('stopping from onTick prevents further refreshes', () => {
    const refresher = new DurationRefresher();
    const onTick = vi.fn(() => refresher.stop());

    refresher.start(Date.now(), onTick);
    vi.advanceTimersByTime(2000);
    vi.advanceTimersByTime(10_000);

    expect(onTick).toHaveBeenCalledOnce();
  });

  test('starting from onTick replaces the pending schedule', () => {
    const refresher = new DurationRefresher();
    const onTick = vi.fn(() => {
      if (onTick.mock.calls.length === 1) {
        refresher.start(Date.now(), onTick);
      }
    });

    refresher.start(Date.now(), onTick);
    vi.advanceTimersByTime(2000);
    vi.advanceTimersByTime(2000);

    expect(onTick).toHaveBeenCalledTimes(2);
  });
});
