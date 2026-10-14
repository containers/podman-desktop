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
 * Utility class for validating and sanitizing ARIA keyboard shortcuts
 */
export class KeyboardUtils {
  private static readonly VALID_MODIFIERS = ['Control', 'Meta', 'Shift', 'Alt', 'AltGraph'];

  /**
   * Validates that a keyboard shortcut string follows the ARIA aria-keyshortcuts format.
   *
   * Per the ARIA spec, the attribute value is case-insensitive.
   * Valid format: "Modifier+Key" or an unmodified function key (F1-F19), where multiple shortcuts are
   * space-separated.
   * Examples:
   *   - "Control+ArrowLeft" or "control+arrowleft"
   *   - "Control+ArrowLeft Meta+ArrowLeft"
   *   - "Shift+Alt+Delete"
   *   - "F1" or "F19"
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-keyshortcuts
   * @param value - The keyboard shortcut string to validate
   * @returns true if the string is valid, false otherwise
   */
  isValidAriaKeyShortcuts(value: string | undefined): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    // Split by spaces to get individual shortcuts
    const shortcuts = value.trim().split(/\s+/);

    if (shortcuts.length === 0) {
      return false;
    }

    return shortcuts.every(shortcut => this.isValidShortcut(shortcut));
  }

  /**
   * Sanitizes a keyboard shortcut string by filtering out invalid shortcuts.
   *
   * @param value - The keyboard shortcut string to sanitize
   * @returns A sanitized string with only valid shortcuts, or undefined if none are valid
   */
  sanitizeAriaKeyShortcuts(value: string | undefined): string | undefined {
    if (!value || typeof value !== 'string') {
      return undefined;
    }

    const shortcuts = value.trim().split(/\s+/);
    const validShortcuts = shortcuts.filter(shortcut => this.isValidShortcut(shortcut));

    const validShortcutsCount = validShortcuts.length;
    if (validShortcutsCount !== shortcuts.length) {
      console.error('Invalid keyboard shortcuts', value);
    }

    return validShortcutsCount > 0 ? validShortcuts.join(' ') : undefined;
  }

  private isValidShortcut(shortcut: string): boolean {
    if (!shortcut || shortcut.length === 0) {
      return false;
    }

    // Split by + to get parts
    const parts = shortcut.split('+');

    // Only function keys F1-F19 are valid without modifiers.
    if (parts.length < 2) {
      return this.isValidFunctionKey(shortcut);
    }

    // All parts except the last must be valid modifiers
    const modifiers = parts.slice(0, -1);
    const key = parts[parts.length - 1];

    // Check modifiers are valid (case-insensitive per ARIA spec)
    const validModifiersLower = KeyboardUtils.VALID_MODIFIERS.map(m => m.toLowerCase());
    if (!modifiers.every(mod => validModifiersLower.includes(mod.toLowerCase()))) {
      return false;
    }

    // Key must not be empty
    if (!key || key.length === 0) {
      return false;
    }

    return this.isValidModifiedShortcutKey(key);
  }

  private isValidFunctionKey(key: string): boolean {
    return /^F([1-9]|1\d)$/i.test(key);
  }

  private isValidModifiedShortcutKey(key: string): boolean {
    // Modified non-function keys are valid; function keys must be within F1-F19.
    return !/^F\d+$/i.test(key) || this.isValidFunctionKey(key);
  }
}
