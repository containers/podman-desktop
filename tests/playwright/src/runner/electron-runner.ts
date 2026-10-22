/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import type { ChildProcess } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

import type { ElectronApplication, JSHandle, Page } from '@playwright/test';
import { _electron as electron } from '@playwright/test';
import type { BrowserWindow } from 'electron';

import { Runner } from '/@/runner/podman-desktop-runner';
import { RunnerFactory } from '/@/runner/runner-factory';
import type { RunnerOptions } from '/@/runner/runner-options';

type WindowState = {
  isVisible: boolean;
  isDevToolsOpened: boolean;
  isCrashed: boolean;
};

export class ElectronRunner extends Runner {
  protected _app: ElectronApplication | undefined;

  protected static readonly MAX_STARTUP_ATTEMPTS = 3;
  protected static readonly APP_RENDER_TIMEOUT_MS = 15_000;

  public constructor(options?: { runnerOptions?: RunnerOptions }) {
    super(options);
    console.log('ElectronRunner constructor');
  }

  public override async start(): Promise<Page> {
    if (this.isRunning()) {
      console.log('Podman Desktop is already running');
      return this.getPage();
    }

    const maxAttempts = ElectronRunner.MAX_STARTUP_ATTEMPTS;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const launched = await this.launchAndVerify(attempt, maxAttempts);
      if (launched) {
        break;
      }
    }

    // Direct Electron console to Node terminal and collect in buffer.
    this.getPage().on('console', msg => {
      this.pushConsoleMessage(msg.text());
      console.log(msg);
    });

    // Start playwright tracing
    await this.startTracing();

    // Verify video recording is active on the page's context
    const video = this.getPage().video();
    if (video) {
      const videoPath = await video.path();
      console.log(`Video recording started, will be saved to: ${videoPath}`);
    } else {
      console.log('Warning: Video recording is not active on this page');
    }

    // also get stderr from the node process
    this.getElectronApp()
      .process()
      .stderr?.on('data', data => {
        console.log(`STDERR: ${data}`);
      });

    return this.getPage();
  }

  /**
   * Attempt a single Electron launch cycle: launch the app, wait for the first
   * window, and verify the renderer actually painted (Svelte mounted into #app).
   *
   * @returns `true` when the app rendered successfully and is ready for use.
   * @throws when this is the final allowed attempt and the app still failed.
   */
  private async launchAndVerify(attempt: number, maxAttempts: number): Promise<boolean> {
    try {
      console.log(`Starting Podman Desktop (attempt ${attempt}/${maxAttempts})`);
      console.log('Electron app launch options: ');
      Object.keys(this._options).forEach(key => {
        console.log(`${key}: ${(this._options as { [k: string]: string })[key]}`);
      });
      this._app = await electron.launch({
        ...this._options,
      });
      this._page = await this.getElectronApp().firstWindow();
      this._running = true;

      const filePath = await this.getElectronApp().evaluate(async ({ app }) => app.getPath('exe'));
      console.log(`The Executable Electron app. file: ${filePath}`);
    } catch (err) {
      console.log(`Caught exception in startup (attempt ${attempt}): ${err}`);
      await this.closeAfterFailedStart();
      throw new Error(`Podman Desktop could not be started correctly with error: ${err}`);
    }

    const rendered = await this.waitForAppRendered(ElectronRunner.APP_RENDER_TIMEOUT_MS);
    if (rendered) {
      if (attempt > 1) {
        console.log(`Podman Desktop rendered successfully on attempt ${attempt}`);
      }
      return true;
    }

    console.log(
      `Blank screen detected on attempt ${attempt}/${maxAttempts} — ` +
        `app did not render within ${ElectronRunner.APP_RENDER_TIMEOUT_MS}ms`,
    );
    await this.closeAfterFailedStart();

    if (attempt >= maxAttempts) {
      throw new Error(
        `Podman Desktop started with a blank screen on all ${maxAttempts} attempts. ` +
          'The Electron renderer never mounted the application UI.',
      );
    }

    return false;
  }

  /**
   * Wait for the Svelte application to mount inside the `#app` root element.
   * Returns `true` when the app has rendered meaningful content, `false` on timeout.
   */
  private async waitForAppRendered(timeout: number): Promise<boolean> {
    if (!this._page) return false;
    try {
      await this._page.waitForFunction(
        () => {
          const app = document.getElementById('app');
          return app !== null && app.children.length > 0;
        },
        undefined,
        { timeout },
      );
      console.log('Application UI rendered successfully');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Minimal teardown after a failed or blank-screen launch.
   * Stops the Electron process without saving traces or videos since
   * they were not yet initialized at this point.
   */
  private async closeAfterFailedStart(): Promise<void> {
    const proc = this._app?.process();
    const pid = proc?.pid;
    console.log(`Closing failed Podman Desktop instance (PID: ${pid})`);
    try {
      if (this._app) {
        await this.raceWithTimeout(this._app.close(), 10_000, 'close() after failed start timed out');
      }
    } catch (err) {
      console.log(`Failed to close app cleanly after failed start: ${err}`);
      this.ensureElectronProcessesStopped(pid);
    }

    if (proc) {
      await this.waitForProcessExit(proc, pid, 5_000);
    }

    this._app = undefined;
    this._page = undefined;
    this._running = false;
  }

  public getElectronApp(): ElectronApplication {
    if (this._app) {
      return this._app;
    }

    throw Error('Application was not started yet');
  }

  /**
   * Get all pages (windows) from the Electron application.
   * Returns all windows including webviews.
   */
  public getWindows(): Page[] {
    return this.getElectronApp().windows();
  }

  public async getBrowserWindow(): Promise<JSHandle<BrowserWindow>> {
    return await this.getElectronApp().browserWindow(this.getPage());
  }

  public async getBrowserWindowState(): Promise<WindowState> {
    return await (await this.getBrowserWindow()).evaluate((mainWindow): Promise<WindowState> => {
      const getState = (): { isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean } => {
        return {
          isVisible: mainWindow.isVisible(),
          isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
          isCrashed: mainWindow.webContents.isCrashed(),
        };
      };

      return new Promise(resolve => {
        /**
         * The main window is created hidden, and is shown only when it is ready.
         * See {@link ../packages/main/src/mainWindow.ts} function
         */
        if (mainWindow.isVisible()) {
          resolve(getState());
        } else
          mainWindow.once('ready-to-show', () => {
            resolve(getState());
          });
      });
    });
  }

  public override async close(timeout = 30_000): Promise<void> {
    console.log('Starting Podman Desktop close sequence');

    try {
      await this.raceWithTimeout(this.stopTracing(), timeout / 2, 'stopTracing timed out');
    } catch (err: unknown) {
      console.log(`stopTracing failed or timed out, continuing with close: ${err}`);
    }

    if (!this.isRunning()) {
      throw Error('Podman Desktop is not running');
    }

    const proc = this._app?.process();
    const pid = proc?.pid;
    console.log(`Closing Podman Desktop with a timeout of ${timeout} ms, PID: ${pid}`);
    try {
      await this.raceWithTimeout(
        this.getElectronApp().close(),
        timeout,
        `electronApp.close() timed out after ${timeout} ms`,
      );
    } catch (err: unknown) {
      console.log(`Caught exception in closing: ${err}`);
      this.ensureElectronProcessesStopped(pid);
    }

    await this.waitForProcessExit(proc, pid, 5_000);

    this._running = false;
    RunnerFactory.dispose();

    if (this._videoAndTraceName) {
      const videoPath = join(this._testOutput, 'videos', `${this._videoAndTraceName}.webm`);
      try {
        const elapsed = await this.trackTime(async () => await this.saveVideoAs(videoPath));
        console.log(`Saving a video file took: ${elapsed} ms`);
        console.log(`Video file saved as: ${videoPath}`);
      } catch (err: unknown) {
        console.log(`Failed to save video: ${err}`);
      }
    }
    await this.removeTracesOnFinished();
  }

  /**
   * Ensure no Electron processes survive after close. Tries a targeted kill by
   * PID first; if no PID is available (e.g. the process already crashed with
   * STATUS_STACK_BUFFER_OVERRUN and the handle is gone), falls back to killing
   * all Electron processes by image name. This prevents a stale
   * single-instance lock from blocking subsequent test launches.
   */
  protected async waitForProcessExit(
    proc: ChildProcess | undefined | null,
    pid: number | undefined,
    timeout: number,
  ): Promise<void> {
    if (proc?.exitCode !== null || proc?.signalCode !== null) {
      return;
    }
    console.log(`Waiting up to ${timeout}ms for PID ${pid} to exit...`);
    try {
      await this.raceWithTimeout(
        new Promise<void>(resolve => {
          proc.on('exit', resolve);
        }),
        timeout,
        `Process ${pid} did not exit within ${timeout}ms`,
      );
      console.log(`Process ${pid} exited`);
    } catch {
      console.log(`Process ${pid} still alive after ${timeout}ms, force-killing`);
      this.ensureElectronProcessesStopped(pid);
    }
  }

  protected ensureElectronProcessesStopped(pid: number | undefined): void {
    if (pid) {
      this.forceKillByPid(pid);
    } else {
      console.log('No PID available (process may have crashed) — falling back to image-name kill');
      this.forceKillByName();
    }
  }

  protected forceKillByPid(pid: number): void {
    console.log(`Force-killing Electron process tree by PID: ${pid}`);
    try {
      if (process.platform === 'win32') {
        // eslint-disable-next-line sonarjs/no-os-command-from-path, n/no-sync
        execFileSync('taskkill', ['/F', '/T', '/PID', String(pid)], { timeout: 30_000 });
      } else {
        process.kill(pid, 'SIGKILL');
      }
    } catch (error: unknown) {
      console.log(`Exception killing PID ${pid}: ${error}`);
    }
  }

  protected forceKillByName(): void {
    console.log('Force-killing Electron processes by image name');
    try {
      if (process.platform === 'win32') {
        // eslint-disable-next-line sonarjs/no-os-command-from-path, n/no-sync
        execFileSync('taskkill', ['/F', '/IM', 'electron.exe', '/T'], {
          timeout: 15_000,
          stdio: 'pipe',
        });
      } else {
        // eslint-disable-next-line sonarjs/no-os-command-from-path, n/no-sync
        execFileSync('pkill', ['-9', '-f', 'electron'], {
          timeout: 15_000,
          stdio: 'pipe',
        });
      }
      console.log('Orphaned Electron processes killed');
    } catch (error: unknown) {
      // Non-zero exit is expected when no matching processes exist
      console.log(`No orphaned Electron processes found or cleanup skipped: ${error}`);
    }
  }

  protected override defaultOptions(): object {
    const pdArgs = process.env.PODMAN_DESKTOP_ARGS;
    const pdBinary = process.env.PODMAN_DESKTOP_BINARY;
    const directory = join(this._testOutput, 'videos');
    const tracesDir = join(this._testOutput, 'traces', 'raw');
    console.log(`video will be written to: ${directory}`);
    const env = this.setupPodmanDesktopCustomFolder();
    const recordVideo = {
      dir: directory,
      size: {
        width: 1050,
        height: 700,
      },
    };
    const args = pdArgs ? [pdArgs] : ['.'];
    // executablePath defaults to this package's installation location: node_modules/.bin/electron
    const executablePath = pdArgs ? join(pdArgs, 'node_modules', '.bin', 'electron') : (pdBinary ?? undefined);
    const timeout = this._runnerOptions._electronLaunchTimeout;
    return {
      args,
      executablePath,
      env,
      recordVideo,
      timeout,
      tracesDir,
    };
  }
}
