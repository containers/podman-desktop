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

import { tabWithinParent } from './dialog-utils';

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
  container.querySelectorAll = vi.fn().mockImplementation(() => {
    return [{ name: 'a component' }, button1, button2, { name: 'another component' }, button3];
  });

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
