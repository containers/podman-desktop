/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { cubicOut } from 'svelte/easing';
import { expect, test } from 'vitest';

import { fadeSlide } from './animations';

test('fadeSlide', () => {
  const delay = 10;
  const duration = 300;
  const element = document.createElement('div');
  element.style.setProperty('opacity', '50');
  element.style.setProperty('height', '100px');
  element.style.setProperty('padding-top', '4px');
  element.style.setProperty('padding-bottom', '8px');
  const result = fadeSlide(element, { delay, duration, easing: cubicOut });
  expect(result.delay).toEqual(delay);
  expect(result.duration).toEqual(duration);
  expect(result.easing).toEqual(cubicOut);
  const css = result.css;
  expect(css(0)).toEqual('overflow: hidden;opacity: 0;height: 0px;padding-top: 0px;padding-bottom: 0px;');
  expect(css(0.5)).toEqual('overflow: hidden;opacity: 25;height: 50px;padding-top: 2px;padding-bottom: 4px;');
  expect(css(1)).toEqual('overflow: hidden;opacity: 50;height: 100px;padding-top: 4px;padding-bottom: 8px;');
});
