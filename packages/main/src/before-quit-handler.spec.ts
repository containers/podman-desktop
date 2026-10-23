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
import { beforeEach, expect, test, vi } from 'vitest';

import { createBeforeQuitHandler } from './before-quit-handler.js';

const asyncDispose = vi.fn<() => Promise<void>>();
const quit = vi.fn<() => void>();
let stoppedExtensions: { val: boolean };

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  stoppedExtensions = { val: false };
});

function createEvent(): { preventDefault: () => void } {
  return { preventDefault: vi.fn() };
}

test('second before-quit while disposal is in flight is vetoed and does not dispose again', async () => {
  const disposal = Promise.withResolvers<void>();
  asyncDispose.mockReturnValue(disposal.promise);
  const handler = createBeforeQuitHandler({
    getExtensionLoader: () => ({ asyncDispose }),
    getStoppedExtensions: () => stoppedExtensions,
    quit,
  });

  const first = createEvent();
  const second = createEvent();
  handler(first);
  handler(second);

  expect(first.preventDefault).toHaveBeenCalledOnce();
  expect(second.preventDefault).toHaveBeenCalledOnce();
  expect(asyncDispose).toHaveBeenCalledOnce();
  expect(quit).not.toHaveBeenCalled();

  disposal.resolve();
  await vi.waitFor(() => expect(quit).toHaveBeenCalledOnce());
});

test('once disposal resolves, quit is called and the next before-quit is not vetoed', async () => {
  asyncDispose.mockResolvedValue();
  const handler = createBeforeQuitHandler({
    getExtensionLoader: () => ({ asyncDispose }),
    getStoppedExtensions: () => stoppedExtensions,
    quit,
  });

  handler(createEvent());
  await vi.waitFor(() => expect(quit).toHaveBeenCalledOnce());
  expect(stoppedExtensions.val).toBe(true);

  const next = createEvent();
  handler(next);

  expect(next.preventDefault).not.toHaveBeenCalled();
  expect(asyncDispose).toHaveBeenCalledOnce();
});

test('disposal rejecting still sets stoppedExtensions and quits', async () => {
  asyncDispose.mockRejectedValue(new Error('dispose failed'));
  const handler = createBeforeQuitHandler({
    getExtensionLoader: () => ({ asyncDispose }),
    getStoppedExtensions: () => stoppedExtensions,
    quit,
  });

  handler(createEvent());
  await vi.waitFor(() => expect(quit).toHaveBeenCalledOnce());

  expect(stoppedExtensions.val).toBe(true);
});

test('no extension loader yet sets the flag and does not veto', () => {
  const handler = createBeforeQuitHandler({
    getExtensionLoader: () => undefined,
    getStoppedExtensions: () => stoppedExtensions,
    quit,
  });

  const event = createEvent();
  handler(event);

  expect(event.preventDefault).not.toHaveBeenCalled();
  expect(stoppedExtensions.val).toBe(true);
  expect(asyncDispose).not.toHaveBeenCalled();
  expect(quit).not.toHaveBeenCalled();
});
