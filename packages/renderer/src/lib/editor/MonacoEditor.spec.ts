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

import '@testing-library/jest-dom/vitest';

import { render } from '@testing-library/svelte';
import * as monaco from 'monaco-editor';
import { beforeEach, expect, test, vi } from 'vitest';

import { AppearanceUtil } from '/@/lib/appearance/appearance-util';

import MonacoEditor from './MonacoEditor.svelte';

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.getConfigurationValue).mockResolvedValue(12);
  vi.mocked(window.openExternal).mockResolvedValue();
  vi.spyOn(AppearanceUtil.prototype, 'getColor').mockReturnValue('#1e1e1e');
});

test('registers link opener with monaco editor and opens external URLs', async () => {
  let registeredOpener: monaco.editor.ILinkOpener | undefined;
  const disposeMock = vi.fn();

  vi.spyOn(monaco.editor, 'registerLinkOpener').mockImplementation(opener => {
    registeredOpener = opener;
    return { dispose: disposeMock };
  });

  const { unmount } = render(MonacoEditor, {
    content: '{"url": "https://podman-desktop.io"}',
    language: 'json',
  });

  await vi.waitFor(() => {
    expect(monaco.editor.registerLinkOpener).toHaveBeenCalled();
  });

  expect(registeredOpener).toBeDefined();

  const uri = monaco.Uri.parse('https://podman-desktop.io/docs');
  const result = await registeredOpener?.open(uri);

  expect(result).toBe(true);
  expect(window.openExternal).toHaveBeenCalledWith('https://podman-desktop.io/docs');

  unmount();
  expect(disposeMock).toHaveBeenCalled();
});
