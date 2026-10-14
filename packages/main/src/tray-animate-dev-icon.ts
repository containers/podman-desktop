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

import { type NativeImage, nativeImage } from 'electron';

import { AnimatedTray } from './tray-animate-icon.js';
import { isMac } from './util.js';

/**
 * Dev-mode tray that stamps a "DEV" pixel-text badge onto macOS template icons.
 */
export class AnimatedDevTray extends AnimatedTray {
  readonly #DEV_BADGE_ROWS = ['##..###.#.#', '#.#.#...#.#', '#.#.##..#.#', '#.#.#...#.#', '##..###..#.'];
  readonly #BADGE_OFFSET_X = 3;
  readonly #BADGE_OFFSET_Y = 10;
  readonly #BADGE_CLEAR_MARGIN = 1;
  protected override getAppDisplayName(): string {
    const branch = import.meta.env['VITE_GIT_BRANCH'] ?? '';
    return branch ? `${super.getAppDisplayName()} Dev (${branch})` : `${super.getAppDisplayName()} Dev`;
  }

  protected override getIconPath(iconName: string): string | Electron.NativeImage {
    const iconPath = super.getIconPath(iconName);
    if (!isMac()) {
      return iconPath;
    }
    try {
      const base = typeof iconPath === 'string' ? nativeImage.createFromPath(iconPath) : iconPath;
      const stamped = this.#stampDevBadge(base);
      if (base.getScaleFactors().includes(2)) {
        const retinaStamped = this.#stampDevBadge(base, 2);
        stamped.addRepresentation({
          scaleFactor: 2,
          dataURL: retinaStamped.toDataURL(),
        });
      }
      if (this.color !== 'dark') {
        stamped.setTemplateImage(true);
      }
      return stamped;
    } catch (error) {
      console.warn('[tray] dev badge could not be stamped; using plain icon', error);
      return iconPath;
    }
  }

  #stampDevBadge(base: NativeImage, scaleFactor = 1): NativeImage {
    const { width, height } = base.getSize();
    if (width <= 0 || height <= 0) {
      return base;
    }

    const bitmap = Buffer.from(base.toBitmap({ scaleFactor }));
    const pixelWidth = width * scaleFactor;
    const pixelHeight = height * scaleFactor;

    const clearLeft = (this.#BADGE_OFFSET_X - this.#BADGE_CLEAR_MARGIN) * scaleFactor;
    const clearTop = (this.#BADGE_OFFSET_Y - this.#BADGE_CLEAR_MARGIN) * scaleFactor;
    const clearRight =
      (this.#BADGE_OFFSET_X + this.#DEV_BADGE_ROWS[0]!.length + this.#BADGE_CLEAR_MARGIN) * scaleFactor;
    const clearBottom = (this.#BADGE_OFFSET_Y + this.#DEV_BADGE_ROWS.length + this.#BADGE_CLEAR_MARGIN) * scaleFactor;
    for (let y = Math.max(0, clearTop); y < Math.min(pixelHeight, clearBottom); y++) {
      for (let x = Math.max(0, clearLeft); x < Math.min(pixelWidth, clearRight); x++) {
        bitmap.fill(0x00, (y * pixelWidth + x) * 4, (y * pixelWidth + x) * 4 + 4);
      }
    }

    for (let row = 0; row < this.#DEV_BADGE_ROWS.length; row++) {
      const pattern = this.#DEV_BADGE_ROWS[row]!;
      for (let col = 0; col < pattern.length; col++) {
        if (pattern[col] !== '#') {
          continue;
        }
        for (let dy = 0; dy < scaleFactor; dy++) {
          for (let dx = 0; dx < scaleFactor; dx++) {
            const x = (this.#BADGE_OFFSET_X + col) * scaleFactor + dx;
            const y = (this.#BADGE_OFFSET_Y + row) * scaleFactor + dy;
            if (x >= pixelWidth || y >= pixelHeight) {
              continue;
            }
            const offset = (y * pixelWidth + x) * 4;
            bitmap[offset] = 0x00;
            bitmap[offset + 1] = 0x00;
            bitmap[offset + 2] = 0x00;
            bitmap[offset + 3] = 0xff;
          }
        }
      }
    }

    return nativeImage.createFromBitmap(bitmap, { width: pixelWidth, height: pixelHeight });
  }
}
