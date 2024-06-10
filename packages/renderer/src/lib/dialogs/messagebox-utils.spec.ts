/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { withConfirmation } from './messagebox-utils';

beforeEach(() => {
  vi.resetAllMocks();
});

test('expect withConfirmation call callback if result OK', async () => {
  const showMessageBoxMock = vi.fn();
  (window as any).showMessageBox = showMessageBoxMock;
  showMessageBoxMock.mockResolvedValue({ response: 0 });

  const callback = vi.fn();
  withConfirmation(callback, 'Destroy world');

  await vi.waitFor(() => {
    expect(showMessageBoxMock).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalled();
  });
});

test('expect withConfirmation not to call callback if result not OK', async () => {
  const showMessageBoxMock = vi.fn();
  (window as any).showMessageBox = showMessageBoxMock;
  showMessageBoxMock.mockResolvedValue({ response: 1 });

  const callback = vi.fn();
  withConfirmation(callback, 'Destroy world');

  await vi.waitFor(() => {
    expect(showMessageBoxMock).toHaveBeenCalledOnce();
    expect(callback).not.toHaveBeenCalled();
  });
});

test('expect withConfirmation to propagate error', async () => {
  const showMessageBoxMock = vi.fn();
  (window as any).showMessageBox = showMessageBoxMock;
  const error = new Error('Dummy error');
  showMessageBoxMock.mockRejectedValue(error);

  const callback = vi.fn();
  withConfirmation(callback, 'Destroy world');

  await vi.waitFor(() => {
    expect(showMessageBoxMock).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(error);
  });
});
