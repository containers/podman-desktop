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

const normalize = (text: string): string =>
  text.normalize('NFC').toLowerCase().replace(/\p{P}/gu, '').replace(/\s+/g, ' ').trim();

/**
 * WCAG 2.5.3 label-in-name: the accessible name must contain the visible text.
 * Case, punctuation and whitespace differences are ignored.
 */
export function isLabelInName(accessibleName: string, visibleText: string): boolean {
  const normalizedText = normalize(visibleText);
  return !normalizedText || normalize(accessibleName).includes(normalizedText);
}

/**
 * Warn once when the visible text of a button is missing from its aria-label.
 * Buttons without an aria-label or without visible text (icon only) are not checked.
 */
export function warnIfLabelNotInName(accessibleName: string | undefined, visibleText: string | null): void {
  const text = (visibleText ?? '').replace(/\s+/g, ' ').trim();
  if (accessibleName && !isLabelInName(accessibleName, text)) {
    console.warn(`Button aria-label "${accessibleName}" does not contain its visible text "${text}"`);
  }
}
