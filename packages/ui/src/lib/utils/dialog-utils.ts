/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

export function tabWithinParent(e: KeyboardEvent, parent: HTMLDivElement): void {
  // trap focus within parent element
  const nodes = parent.querySelectorAll<HTMLElement>('*');
  const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

  let index = tabbable.indexOf(document.activeElement as HTMLElement);
  if (index === -1 && e.shiftKey) index = 0;

  index += tabbable.length + (e.shiftKey ? -1 : 1);
  index %= tabbable.length;

  tabbable[index].focus();
  e.preventDefault();
}

export class ModalStack {
  // Open modals in mount order, so only the topmost one handles Enter when modals are stacked.
  #modals: HTMLElement[] = [];

  register(modal: HTMLElement): () => void {
    this.#modals.push(modal);
    return (): void => {
      const index = this.#modals.indexOf(modal);
      if (index !== -1) this.#modals.splice(index, 1);
    };
  }

  // Enter activates the button marked `default`, like a native desktop dialog. Controls that consume Enter
  // themselves (buttons, links, textareas, selects, contenteditable) keep their native behavior.
  // A body target means focus was dropped (e.g. a click on the dialog text), so the modal still owns the key.
  activateDefaultButton(e: KeyboardEvent, modal: HTMLElement): void {
    if (
      this.#modals.at(-1) !== modal ||
      e.defaultPrevented ||
      e.isComposing ||
      e.repeat ||
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey
    ) {
      return;
    }
    if (
      !(e.target instanceof HTMLElement) ||
      (e.target !== document.body && !modal.contains(e.target)) ||
      e.target.isContentEditable ||
      e.target.closest('button, a, textarea, select, input[type="button"], input[type="submit"], input[type="reset"]')
    ) {
      return;
    }
    const defaultButton = modal.querySelector<HTMLButtonElement>('button[data-default]:enabled');
    if (defaultButton) {
      e.preventDefault();
      defaultButton.click();
    }
  }
}

export const modalStack = new ModalStack();
