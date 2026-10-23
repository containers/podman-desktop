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

import { beforeEach, expect, test, vi } from 'vitest';

import { ModalStack, tabWithinParent } from './dialog-utils';

beforeEach(() => {
  vi.resetAllMocks();
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

let stack: ModalStack;
let modal: HTMLDivElement;
let input: HTMLInputElement;
let defaultButton: HTMLButtonElement;
const onDefaultClick = vi.fn();

function createModal(): { modal: HTMLDivElement; input: HTMLInputElement; defaultButton: HTMLButtonElement } {
  const modal = document.createElement('div');
  const input = document.createElement('input');
  const defaultButton = document.createElement('button');
  defaultButton.setAttribute('data-default', '');
  modal.append(input, defaultButton);
  return { modal, input, defaultButton };
}

function pressEnter(target: HTMLElement, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  stack = new ModalStack();
  ({ modal, input, defaultButton } = createModal());
  defaultButton.addEventListener('click', onDefaultClick);
  stack.register(modal);
});

test('activateDefaultButton clicks the default button on Enter from an input', () => {
  const event = pressEnter(input);
  stack.activateDefaultButton(event, modal);

  expect(onDefaultClick).toHaveBeenCalledOnce();
  expect(event.defaultPrevented).toBe(true);
});

test.each([
  { shiftKey: true },
  { ctrlKey: true },
  { altKey: true },
  { metaKey: true },
  { isComposing: true },
  { repeat: true },
])('activateDefaultButton ignores Enter with %o', init => {
  stack.activateDefaultButton(pressEnter(input, init), modal);

  expect(onDefaultClick).not.toHaveBeenCalled();
});

test('activateDefaultButton ignores Enter when the modal is not topmost', () => {
  stack.register(createModal().modal);
  stack.activateDefaultButton(pressEnter(input), modal);

  expect(onDefaultClick).not.toHaveBeenCalled();
});

test('the lower modal handles Enter again once the topmost one is unregistered', () => {
  const unregisterUpper = stack.register(createModal().modal);
  unregisterUpper();
  stack.activateDefaultButton(pressEnter(input), modal);

  expect(onDefaultClick).toHaveBeenCalledOnce();
});

test('activateDefaultButton leaves Enter on a button, and outside the modal, alone', () => {
  const outside = document.createElement('input');
  stack.activateDefaultButton(pressEnter(defaultButton), modal);
  stack.activateDefaultButton(pressEnter(outside), modal);

  expect(onDefaultClick).not.toHaveBeenCalled();
});

test.each(['button', 'submit', 'reset'])('activateDefaultButton leaves Enter on an input of type %s alone', type => {
  const inputButton = document.createElement('input');
  inputButton.type = type;
  modal.append(inputButton);
  stack.activateDefaultButton(pressEnter(inputButton), modal);

  expect(onDefaultClick).not.toHaveBeenCalled();
});

test('activateDefaultButton works when focus dropped to the body', () => {
  stack.activateDefaultButton(pressEnter(document.body), modal);

  expect(onDefaultClick).toHaveBeenCalledOnce();
});

test('activateDefaultButton skips a disabled default button', () => {
  defaultButton.disabled = true;
  stack.activateDefaultButton(pressEnter(document.body), modal);

  expect(onDefaultClick).not.toHaveBeenCalled();
});
