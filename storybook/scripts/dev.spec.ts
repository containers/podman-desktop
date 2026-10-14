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

import { EventEmitter } from 'node:events';

import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock(import('node:child_process'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    spawn: vi.fn(),
    spawnSync: vi.fn(),
  };
});

vi.mock(import('../../node_modules/@sveltejs/package/src/index.js'), () => ({
  watch: vi.fn(),
}));

vi.mock(import('../../node_modules/@sveltejs/package/src/config.js'), () => ({
  load_config: vi.fn(),
}));

import { spawn, spawnSync } from 'node:child_process';

import { load_config as loadUiPackageConfig } from '../../node_modules/@sveltejs/package/src/config.js';
import { watch as watchUiPackage } from '../../node_modules/@sveltejs/package/src/index.js';

import { getExitCode, main, stopStorybook } from './dev.mjs';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getExitCode', () => {
  test('returns the exit code when the process exited with one', () => {
    expect(getExitCode(2, null)).toBe(2);
  });

  test('returns the conventional 128+signal code for a signal exit', () => {
    expect(getExitCode(null, 'SIGINT')).toBe(130);
    expect(getExitCode(null, 'SIGTERM')).toBe(143);
  });

  test('returns 1 when there is neither a code nor a signal', () => {
    expect(getExitCode(null, null)).toBe(1);
  });
});

describe('stopStorybook', () => {
  test('signals the process group on POSIX', () => {
    const killSpy = vi.spyOn(process, 'kill').mockImplementation(() => true);
    const storybook = { pid: 123 };

    stopStorybook(storybook, 'SIGINT', false);

    expect(killSpy).toHaveBeenCalledWith(-123, 'SIGINT');
  });

  test('kills the process tree on Windows', () => {
    const storybook = { pid: 456 };

    stopStorybook(storybook, 'SIGINT', true);

    expect(spawnSync).toHaveBeenCalledWith('taskkill', ['/pid', '456', '/T', '/F'], { stdio: 'ignore' });
  });

  test('swallows errors from an already-exited process', () => {
    vi.spyOn(process, 'kill').mockImplementation(() => {
      throw new Error('ESRCH');
    });
    const storybook = { pid: 789 };

    expect(() => stopStorybook(storybook, 'SIGINT', false)).not.toThrow();
  });
});

function setupMainMocks(pid: number): {
  fakeStorybook: EventEmitter & { pid: number };
  onSpy: ReturnType<typeof vi.spyOn<typeof process, 'on'>>;
  exitSpy: ReturnType<typeof vi.spyOn<typeof process, 'exit'>>;
} {
  vi.mocked(loadUiPackageConfig).mockResolvedValue({});
  vi.mocked(watchUiPackage).mockResolvedValue(undefined);

  const fakeStorybook = new EventEmitter() as EventEmitter & { pid: number };
  fakeStorybook.pid = pid;
  vi.mocked(spawn).mockReturnValue(fakeStorybook as never);

  const onSpy = vi.spyOn(process, 'on').mockImplementation(() => process);
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

  return { fakeStorybook, onSpy, exitSpy };
}

describe('main', () => {
  test('waits for the ui package build, then starts storybook', async () => {
    const { fakeStorybook, onSpy, exitSpy } = setupMainMocks(111);

    await main();

    expect(watchUiPackage).toHaveBeenCalled();
    expect(spawn).toHaveBeenCalledWith(
      'storybook',
      ['dev', '-p', '6006'],
      expect.objectContaining({
        stdio: 'inherit',
        env: expect.objectContaining({ STORYBOOK_DISABLE_TELEMETRY: '1' }),
      }),
    );
    expect(onSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));

    fakeStorybook.emit('exit', 0, null);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  test('exits successfully on a user-initiated stop, even if the child reports a nonzero code', async () => {
    // Simulates Windows, where taskkill's forced termination reports its own exit code
    // with no signal, so the child's exit tuple alone can't tell a user stop from a crash.
    const { fakeStorybook, onSpy, exitSpy } = setupMainMocks(222);

    await main();

    const sigintHandler = onSpy.mock.calls.find(([signal]) => signal === 'SIGINT')?.[1] as () => void;
    sigintHandler();

    fakeStorybook.emit('exit', 1, null);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
