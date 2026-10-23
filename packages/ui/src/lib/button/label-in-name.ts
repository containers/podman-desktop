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
 * WCAG 2.5.3 label-in-name: the accessible name of a button must contain its visible text.
 * Case, punctuation, symbol and whitespace differences are ignored; dashes and slashes count as word breaks.
 */
export class LabelInName {
  static #normalize(text: string): string {
    return text
      .normalize('NFC')
      .toLowerCase()
      .replace(/[\p{Pd}\p{Pc}/]/gu, ' ')
      .replace(/[\p{P}\p{S}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static isLabelInName(accessibleName: string, visibleText: string): boolean {
    const normalizedText = LabelInName.#normalize(visibleText);
    return !normalizedText || LabelInName.#normalize(accessibleName).includes(normalizedText);
  }

  /**
   * Warn when the visible text of a button is missing from its aria-label.
   * Buttons without an aria-label or without visible text (icon only) are not checked.
   */
  static warnIfNotInName(accessibleName?: string, visibleText?: string): void {
    const text = (visibleText ?? '').replace(/\s+/g, ' ').trim();
    if (accessibleName && !LabelInName.isLabelInName(accessibleName, text)) {
      console.warn(`Button aria-label "${accessibleName}" does not contain its visible text "${text}"`);
    }
  }
}
