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

import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import VolumeActions from './VolumeActions.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';
import * as contextStore from '/@/stores/context';
import { writable } from 'svelte/store';
import { ContextUI } from '../context/context';

const showMessageBoxMock = vi.fn();
const removeVolumeMock = vi.fn();

vi.mock('/@/stores/context', async () => {
  return {
    context: vi.fn(),
  };
});

beforeAll(() => {
  (window as any).showMessageBox = showMessageBoxMock;
  (window as any).removeVolume = removeVolumeMock;
  vi.mocked(contextStore).context = writable(new ContextUI());
});

test('Expect prompt dialog and deletion', async () => {
  // Mock the showMessageBox to return 0 (yes)
  showMessageBoxMock.mockResolvedValue({ response: 0 });

  const volume: VolumeInfoUI = {
    name: 'dummy',
    status: 'UNUSED',
  } as VolumeInfoUI;

  render(VolumeActions, {
    volume,
  });
  const button = screen.getByTitle('Delete Volume');
  expect(button).toBeDefined();
  await fireEvent.click(button);

  await waitFor(() => {
    expect(showMessageBoxMock).toHaveBeenCalledOnce();
  });

  expect(volume.status).toBe('DELETING');
  expect(removeVolumeMock).toHaveBeenCalled();
});
