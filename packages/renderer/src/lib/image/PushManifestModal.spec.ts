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

import { fireEvent } from '@testing-library/dom';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import type { ImageInfoUI } from './ImageInfoUI';
import PushManifestModal from './PushManifestModal.svelte';

vi.mock('@xterm/xterm', () => {
  return {
    Terminal: vi.fn().mockReturnValue({
      loadAddon: vi.fn(),
      open: vi.fn(),
      write: vi.fn(),
      clear: vi.fn(),
      reset: vi.fn(),
      dispose: vi.fn(),
    }),
  };
});

const getConfigurationValueMock = vi.fn();
const pushManifestMock = vi.fn();

beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
  (window as any).ResizeObserver = vi.fn().mockReturnValue({ observe: vi.fn(), unobserve: vi.fn() });
  (window as any).getImageInspect = vi.fn().mockImplementation(() => Promise.resolve({}));
  (window as any).logsContainer = vi.fn().mockResolvedValue(undefined);
  (window as any).refreshTerminal = vi.fn();
  (window as any).getConfigurationValue = getConfigurationValueMock;
  (window as any).showMessageBox = vi.fn();
  (window as any).pushManifest = pushManifestMock;
});

const fakedManifest: ImageInfoUI = {
  id: 'id',
  shortId: 'shortId',
  name: 'name',
  engineId: 'engineId',
  engineName: 'engineName',
  tag: 'tag',
  createdAt: 0,
  age: 'age',
  size: 0,
  humanSize: 'humanSize',
  base64RepoTag: 'base64RepoTag',
  selected: false,
  status: 'UNUSED',
  icon: {},
  badges: [],
  isManifest: true,
  digest: 'sha256:1234567890',
};

async function waitRender(customProperties: object): Promise<void> {
  render(PushManifestModal, { ...customProperties });
  await tick();
}

test('Expect to render PushManifestModal correctly with Push manifest button', async () => {
  await waitRender({
    manifestInfoToPush: fakedManifest,
    closeCallback: vi.fn(),
  });

  // Get the push button
  const pushButton = screen.getByRole('button', { name: 'Push manifest' });
  expect(pushButton).toBeInTheDocument();

  // Be able to click it
  fireEvent.click(pushButton);
});
