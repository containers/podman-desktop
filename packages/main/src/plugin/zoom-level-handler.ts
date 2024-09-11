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

import type { BrowserWindow } from 'electron';

import { AppearanceSettings } from './appearance-settings.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { IDisposable } from './types/disposable.js';

export class ZoomLevelHandler {
  #browserWindow: BrowserWindow;
  #configurationRegistry: ConfigurationRegistry;
  #disposable: IDisposable | undefined;
  #stepValue = 0.5;
  #maximumZoomLevel = 3;
  #minimumZoomLevel = -3;

  constructor(browserWindow: BrowserWindow, configurationRegistry: ConfigurationRegistry) {
    this.#browserWindow = browserWindow;
    this.#configurationRegistry = configurationRegistry;
  }

  init(): void {
    // restore the zoom level from the configuration
    const configuration = this.#configurationRegistry.getConfiguration(AppearanceSettings.SectionName);

    // zoom level is a number, so we need to cast it to a number
    const zoomLevel = configuration.get<number>(AppearanceSettings.ZoomLevel, 0);

    this.#browserWindow.webContents.zoomLevel = zoomLevel;

    // now subscribe to the zoom level changes
    this.#disposable = this.#configurationRegistry.onDidChangeConfiguration(e => {
      if (e.key === `${AppearanceSettings.SectionName}.${AppearanceSettings.ZoomLevel}`) {
        const val = e.value as number;
        this.#browserWindow.webContents.zoomLevel = val;
      }
    });

    // grab the current step to increase/decrease the zoom level
    const allProperties = this.#configurationRegistry.getConfigurationProperties();
    const record = allProperties[`${AppearanceSettings.SectionName}.${AppearanceSettings.ZoomLevel}`];
    if (record?.step) {
      this.#stepValue = record.step;
    }
    if (record?.maximum) {
      this.#maximumZoomLevel = Number(record.maximum);
    }
    if (record?.minimum) {
      this.#minimumZoomLevel = Number(record.minimum);
    }
  }

  // save the value of the current zoom level into the configuration
  saveValue(): void {
    this.#configurationRegistry
      .updateConfigurationValue(
        `${AppearanceSettings.SectionName}.${AppearanceSettings.ZoomLevel}`,
        this.#browserWindow.webContents.zoomLevel,
      )
      .catch((error: unknown) => {
        console.error('Error saving zoom level', error);
      });
  }

  zoomIn(): void {
    // can't zoom more than the maximum zoom level
    const newZoomLevel = this.precision(this.#browserWindow.webContents.zoomLevel, this.#stepValue);

    if (newZoomLevel > this.#maximumZoomLevel) {
      return;
    }
    this.#browserWindow.webContents.zoomLevel = newZoomLevel;
    this.saveValue();
  }

  zoomOut(): void {
    // can't zoom less than the minimum zoom level
    const newZoomLevel = this.precision(this.#browserWindow.webContents.zoomLevel, -this.#stepValue);
    if (newZoomLevel < this.#minimumZoomLevel) {
      return;
    }
    this.#browserWindow.webContents.zoomLevel = newZoomLevel;

    this.saveValue();
  }

  resetZoom(): void {
    this.#browserWindow.webContents.zoomLevel = 0;
    this.saveValue();
  }

  dispose(): void {
    this.#disposable?.dispose();
  }

  precision(value: number, incrementOrDecrement: number): number {
    const valuePrecisionDigits = value.toString().split('.')[1]?.length ?? 0;
    const stepPrecisionDigits = incrementOrDecrement.toString().split('.')[1]?.length ?? 0;
    // take the maximum of the two
    const precisionDigits = Math.max(valuePrecisionDigits, stepPrecisionDigits);

    // if incrementOrDecrement is negative, it will decrement
    return Number((Number(value) + incrementOrDecrement).toFixed(precisionDigits));
  }
}
