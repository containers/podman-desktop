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

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { activateDefaultButton, isTopmostModal, registerModal, tabWithinParent } from './dialog-utils';

beforeEach(() => {
  vi.clearAllMocks();
});

test('check tabbing order', async () => {
  let active = undefined;

  const button1 = {
    name: 'test1',
    tabIndex: 1,
  } as unknown as HTMLElement;
  button1.focus = vi.fn().mockImplementation(() => {
    active = button1;
  });

  const button2 = {
    name: 'test2',
    tabIndex: 2,
  } as unknown as HTMLElement;
  button2.focus = vi.fn().mockImplementation(() => {
    active = button2;
  });

  const button3 = {
    name: 'test3',
    tabIndex: 3,
  } as unknown as HTMLElement;
  button3.focus = vi.fn().mockImplementation(() => {
    active = button3;
  });

  const event = {} as unknown as KeyboardEvent;
  event.preventDefault = vi.fn();

  const container = {} as HTMLDivElement;
  container.querySelectorAll = vi
    .fn()
    .mockReturnValue([{ name: 'a component' }, button1, button2, { name: 'another component' }, button3]);

  // expect tabbing order to be 1 -> 2 -> 3 -> 1
  vi.spyOn(document, 'activeElement', 'get').mockReturnValue(button1);
  tabWithinParent(event, container);
  expect(active).toBe(button2);

  vi.spyOn(document, 'activeElement', 'get').mockReturnValue(button2);
  tabWithinParent(event, container);
  expect(active).toBe(button3);

  vi.spyOn(document, 'activeElement', 'get').mockReturnValue(button3);
  tabWithinParent(event, container);
  expect(active).toBe(button1);
});

function createModal(): { modal: HTMLDivElement; defaultButton: HTMLButtonElement; input: HTMLInputElement } {
  const modal = document.createElement('div');
  const input = document.createElement('input');
  const defaultButton = document.createElement('button');
  defaultButton.setAttribute('data-default', '');
  modal.append(input, defaultButton);
  document.body.append(modal);
  return { modal, defaultButton, input };
}

function pressEnter(target: HTMLElement, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

afterEach(() => {
  document.body.replaceChildren();
});

test('registerModal tracks the topmost modal and unregisters', () => {
  const first = createModal().modal;
  const second = createModal().modal;
  const unregisterFirst = registerModal(first);
  const unregisterSecond = registerModal(second);

  expect(isTopmostModal(second)).toBe(true);
  expect(isTopmostModal(first)).toBe(false);

  unregisterSecond();
  expect(isTopmostModal(first)).toBe(true);

  unregisterFirst();
  expect(isTopmostModal(first)).toBe(false);
});

test('activateDefaultButton clicks the default button on Enter from an input', () => {
  const { modal, defaultButton, input } = createModal();
  const unregister = registerModal(modal);
  const click = vi.spyOn(defaultButton, 'click');

  const event = pressEnter(input);
  activateDefaultButton(event, modal);

  expect(click).toHaveBeenCalledOnce();
  expect(event.defaultPrevented).toBe(true);
  unregister();
});

test.each([{ shiftKey: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true }, { isComposing: true }])(
  'activateDefaultButton ignores Enter with %o',
  init => {
    const { modal, defaultButton, input } = createModal();
    const unregister = registerModal(modal);
    const click = vi.spyOn(defaultButton, 'click');

    activateDefaultButton(pressEnter(input, init), modal);

    expect(click).not.toHaveBeenCalled();
    unregister();
  },
);

test('activateDefaultButton ignores Enter when the modal is not topmost', () => {
  const { modal, defaultButton, input } = createModal();
  const unregister = registerModal(modal);
  const unregisterOther = registerModal(createModal().modal);
  const click = vi.spyOn(defaultButton, 'click');

  activateDefaultButton(pressEnter(input), modal);

  expect(click).not.toHaveBeenCalled();
  unregisterOther();
  unregister();
});

test('activateDefaultButton leaves Enter on a button, and outside the modal, alone', () => {
  const { modal, defaultButton } = createModal();
  const outside = document.createElement('input');
  document.body.append(outside);
  const unregister = registerModal(modal);
  const click = vi.spyOn(defaultButton, 'click');

  activateDefaultButton(pressEnter(defaultButton), modal);
  activateDefaultButton(pressEnter(outside), modal);

  expect(click).not.toHaveBeenCalled();
  unregister();
});

test('activateDefaultButton works when focus dropped to the body and skips a disabled default button', () => {
  const { modal, defaultButton } = createModal();
  const unregister = registerModal(modal);
  const click = vi.spyOn(defaultButton, 'click');

  activateDefaultButton(pressEnter(document.body), modal);
  expect(click).toHaveBeenCalledOnce();

  defaultButton.disabled = true;
  activateDefaultButton(pressEnter(document.body), modal);
  expect(click).toHaveBeenCalledOnce();
  unregister();
});
