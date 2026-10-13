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
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import type { Page } from '@playwright/test';
import { test } from '@playwright/test';

import { RunnerOptions } from '/@/runner/runner-options';
import { isLinux } from '/@/utility/platform';

const MAX_CONSOLE_MESSAGES = 1_000;

export abstract class Runner {
  protected _options: object;
  protected _running: boolean;
  protected _page: Page | undefined;
  protected readonly _profile: string;
  protected readonly _customFolder;
  protected readonly _testOutput: string;
  protected _videoAndTraceName: string | undefined;
  protected _runnerOptions: RunnerOptions;
  protected _saveTracesOnPass: boolean;
  protected _saveVideosOnPass: boolean;
  protected _consoleMessages: string[];

  protected constructor(options?: { runnerOptions?: RunnerOptions }) {
    this._running = false;
    this._consoleMessages = [];
    this._runnerOptions = options?.runnerOptions ?? new RunnerOptions();
    this._profile = this._runnerOptions._profile;
    this._saveTracesOnPass = this._runnerOptions._saveTracesOnPass;
    this._saveVideosOnPass = this._runnerOptions._saveVideosOnPass;
    this._testOutput = join(this._runnerOptions._customOutputFolder, this._profile);
    this._customFolder = join(this._testOutput, this._runnerOptions._customFolder);
    this._videoAndTraceName = undefined;

    // Options setting always needs to be last action in constructor in order to apply settings correctly
    this._options = this.defaultOptions();
  }

  abstract start(): Promise<Page>;
  abstract close(timeout?: number): Promise<void>;
  protected abstract defaultOptions(): object;

  /**
   * Get all pages (windows) from the application.
   * Returns all windows including webviews.
   */
  public abstract getWindows(): Page[];

  public getPage(): Page {
    if (this._page) {
      return this._page;
    }

    throw Error('Application was not started yet');
  }

  public getConsoleMessages(): string[] {
    return this._consoleMessages;
  }

  protected pushConsoleMessage(text: string): void {
    if (this._consoleMessages.length >= MAX_CONSOLE_MESSAGES) {
      this._consoleMessages.shift();
    }
    this._consoleMessages.push(text);
  }

  public get options(): object {
    return this._options;
  }

  public setOptions(value: object): void {
    this._options = value;
  }

  public isRunning(): boolean {
    return this._running;
  }

  protected setupPodmanDesktopCustomFolder(): object {
    // create a clone of the env. object
    const env = { ...process.env };

    // required to get dashboard opened, https://github.com/podman-desktop/podman-desktop/issues/15220
    if (isLinux) {
      env.XDG_SESSION_TYPE = 'x11';
    }

    if (this._runnerOptions._useDefaultHomeDirectory) {
      // Let the app resolve its own data/config directories against the real host home
      // directory (no PODMAN_DESKTOP_HOME_DIR override, no pre-seeded settings.json).
      console.log('Using the real default home directory (PODMAN_DESKTOP_HOME_DIR override skipped)');
      delete env.PODMAN_DESKTOP_HOME_DIR;
      return env;
    }

    const dir = join(this._customFolder);
    console.log(`podman desktop custom config will be written to: ${dir}`);
    env.PODMAN_DESKTOP_HOME_DIR = dir;

    // add a custom config file by disabling OpenDevTools
    const settingsFile = resolve(dir, 'configuration', 'settings.json');

    // create parent folder if missing
    const parentDir = dirname(settingsFile);
    if (!existsSync(parentDir)) {
      // eslint-disable-next-line n/no-sync
      mkdirSync(parentDir, { recursive: true });
    }

    const settingsContent = this._runnerOptions.createSettingsJson();

    // write the file
    console.log(`disabling OpenDevTools in configuration file ${settingsFile}`);
    // eslint-disable-next-line n/no-sync
    writeFileSync(settingsFile, settingsContent);

    return env;
  }

  public async stopTracing(): Promise<void> {
    let name = '';
    if (this._videoAndTraceName) name = this._videoAndTraceName;

    name = `${name}_trace.zip`;
    await this.getPage()
      .context()
      .tracing.stop({ path: join(this._testOutput, 'traces', name) });
  }

  async saveVideoAs(path: string): Promise<void> {
    const video = this.getPage().video();
    if (video) {
      try {
        await video.saveAs(path);
      } catch (error) {
        console.log(`Caught exception when saving video: ${error}`);
      } finally {
        try {
          await video.delete();
        } catch (error) {
          console.log(`Caught exception when deleting video: ${error}`);
        }
      }
    } else {
      console.log('Video file associated was not found');
    }
  }

  public async startTracing(): Promise<void> {
    await this.getPage().context().tracing.start({ screenshots: true, snapshots: true, sources: true });
    await this.getPage().screenshot();
  }

  async removeTracesOnFinished(): Promise<void> {
    const rawTracesPath = join(this._testOutput, 'traces', 'raw');

    if (existsSync(rawTracesPath)) {
      console.log(`Removing raw traces folder: ${rawTracesPath}`);
      // eslint-disable-next-line n/no-sync
      rmSync(rawTracesPath, { recursive: true, force: true, maxRetries: 5 });
    }

    try {
      const testStatus = test.info().status;
      console.log(`Test finished with status:${testStatus}`);
      if (testStatus !== 'passed' && testStatus !== 'skipped') return;
    } catch (err) {
      console.log(`Caught exception in removing traces: ${err}`);
      return;
    }

    if (!process.env.KEEP_TRACES_ON_PASS && !this._saveTracesOnPass) {
      const tracesPath = join(this._testOutput, 'traces', `${this._videoAndTraceName}_trace.zip`);
      if (existsSync(tracesPath)) {
        console.log(`Removing traces folder: ${tracesPath}`);
        // eslint-disable-next-line n/no-sync
        rmSync(tracesPath, { recursive: true, force: true, maxRetries: 5 });
      }
    }

    if (!process.env.KEEP_VIDEOS_ON_PASS && !this._saveVideosOnPass) {
      const videoPath = join(this._testOutput, 'videos', `${this._videoAndTraceName}.webm`);
      if (existsSync(videoPath)) {
        console.log(`Removing video folder: ${videoPath}`);
        // eslint-disable-next-line n/no-sync
        rmSync(videoPath, { recursive: true, force: true, maxRetries: 5 });
      }
    }
  }

  protected async raceWithTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => reject(new Error(message)), ms);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }

  protected async trackTime(fn: () => Promise<void>): Promise<number> {
    const start = performance.now();
    return await fn
      .call(() => {
        /* no actual logic */
      })
      .then(() => {
        return performance.now() - start;
      });
  }

  public setVideoAndTraceName(name: string): void {
    this._videoAndTraceName = name;

    if (test?.info()?.retry && test.info()?.retry > 0) {
      this._videoAndTraceName += `_retry-${test.info().retry}`;
      return;
    }

    this._videoAndTraceName += `_w${test?.info()?.workerIndex}`;
  }

  public getVideoAndTraceName(): string {
    return this._videoAndTraceName ?? '';
  }

  public getTestOutput(): string {
    return this._testOutput;
  }

  public async screenshot(filename: string): Promise<void> {
    await this.getPage().screenshot({ path: join(this._testOutput, 'screenshots', filename) });
  }
}
