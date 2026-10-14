#!/usr/bin/env node

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
 * Start Storybook with `packages/ui` rebuilding on every source change.
 *
 * Storybook resolves `@podman-desktop/ui-svelte` through the package export map, which
 * points at `packages/ui/dist`. Vite already watches that folder, so keeping `dist` fresh
 * is all that is needed for component edits to hot-reload. This also builds `dist` before
 * Storybook starts, so a fresh checkout works without a separate `build:ui` step.
 *
 * This is `storybook`'s own `dev` script, so it behaves the same whether it's started from
 * the repo root (`pnpm run storybook:dev`) or from inside this package (`pnpm dev`).
 */

import { spawn, spawnSync } from 'node:child_process';
import { constants } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { watch as watchUiPackage } from '../../node_modules/@sveltejs/package/src/index.js';
import { load_config as loadUiPackageConfig } from '../../node_modules/@sveltejs/package/src/config.js';

const uiDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'packages/ui');
const isWindows = process.platform === 'win32';

// Stop Storybook together with everything it started for itself
export function stopStorybook(storybook, signal, windows) {
  try {
    if (windows) {
      spawnSync('taskkill', ['/pid', String(storybook.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      process.kill(-storybook.pid, signal);
    }
  } catch {
    // Already exited.
  }
}

// An explicit exit code wins; otherwise a signal we didn't send gets the conventional
// 128+signal shell exit code, and no code or signal at all is a plain failure
export function getExitCode(code, signal) {
  return code ?? (signal ? 128 + constants.signals[signal] : 1);
}

export async function main() {
  // `watch()` awaits the first build before returning, so `dist` exists once this resolves
  await watchUiPackage({
    cwd: uiDir,
    input: 'src/lib',
    output: 'dist',
    preserve_output: false,
    types: true,
    config: await loadUiPackageConfig({ cwd: uiDir }),
  });

  // Own process group on POSIX, so a signal reaches every process Storybook starts
  const storybook = spawn('storybook', ['dev', '-p', '6006'], {
    stdio: 'inherit',
    shell: isWindows,
    detached: !isWindows,
    env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: '1' },
  });

  // On Windows, taskkill's forced termination reports its own exit code with no
  // signal, so the child's own exit tuple can't tell a user stop from a crash.
  // Track it here instead: any exit after our handler fired is a success.
  let stoppedByUser = false;

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      stoppedByUser = true;
      stopStorybook(storybook, signal, isWindows);
    });
  }

  storybook.on('exit', (code, signal) => {
    process.exit(stoppedByUser ? 0 : getExitCode(code, signal));
  });
}

if (!process.env['VITEST']) {
  await main();
}
