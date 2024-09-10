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

import { parseNotes } from './release-notes-parser';

const mocks = vi.hoisted(() => ({
  existsSyncMock: vi.fn(),
  mkdirSyncMock: vi.fn(),
  readFileSyncMock: vi.fn(),
  writeFileSyncMock: vi.fn(),
}));

vi.mock('node:fs', () => {
  return {
    default: {
      existsSync: mocks.existsSyncMock,
      mkdirSync: mocks.mkdirSyncMock,
      readFileSync: mocks.readFileSyncMock,
      writeFileSync: mocks.writeFileSyncMock,
    },
  };
});

const notesInfo =
  '--- title: test1\nslug: podman-desktop-release-test1\nimage: /img/blog/podman-desktop-release-test1/test1.png\n---';

const notesText = 'import a\ntest1 release title!\n![test1-release](img1)\nello world\n';

const notesPoints =
  '- **line1**:line1 info\n- **line2**:line2 info\n- **line3**:line3 info\n- **line4**:line4 info\n- **line5**:line5 info\n';

const jsonResult = {
  image: 'https://podman-desktop.io/img/blog/podman-desktop-release-test1/test1.png',
  blog: 'https://podman-desktop.io/blog/podman-desktop-release-test1',
  title: 'test1 release title!',
  summary: '- **line1**:line1 info\n- **line2**:line2 info\n- **line3**:line3 info\n- **line4**:line4 info',
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.readFileSyncMock.mockReturnValue(notesInfo + notesText + notesPoints);
  mocks.existsSyncMock.mockReturnValue(true);
});

test('create release-nnotes directory when it does not exist', () => {
  mocks.existsSyncMock.mockReturnValue(false);
  parseNotes('test1File', '1.0');
  expect(mocks.mkdirSyncMock).toHaveBeenCalled();
});

test('Do not create release-nnotes directory when it exist', () => {
  parseNotes('test1File', '1.0');
  expect(mocks.mkdirSyncMock).not.toHaveBeenCalled();
});

test('parse provided release notes as expected', () => {
  parseNotes('test1File', '1.0');
  expect(mocks.writeFileSyncMock).toBeCalledWith('./static/release-notes/1.0.json', JSON.stringify(jsonResult));
});
