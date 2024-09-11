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

import { createNotesFiles } from './release-notes-parser';

const mocks = vi.hoisted(() => ({
  existsSyncMock: vi.fn(),
  mkdirMock: vi.fn(),
  readFileMock: vi.fn(),
  writeFileMock: vi.fn(),
}));

vi.mock('node:fs', () => {
  return {
    default: {
      existsSync: mocks.existsSyncMock,
      promises: {
        mkdir: mocks.mkdirMock,
        readFile: mocks.readFileMock,
        writeFile: mocks.writeFileMock,
      },
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

const defaultParseFrontMatterMock = vi.fn();
const defaultParseFrontMatterResultMock = {
  frontMatter: {
    title: 'Release notes 1.0',
  },
  content: '',
};

const params = {
  filePath: 'file/test1file',
  fileContent: notesInfo + notesText + notesPoints,
  defaultParseFrontMatter: defaultParseFrontMatterMock,
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.readFileMock.mockReturnValue(notesInfo + notesText + notesPoints);
  mocks.existsSyncMock.mockReturnValue(true);
  defaultParseFrontMatterMock.mockResolvedValue(defaultParseFrontMatterResultMock);
});

test('create release-notes directory when it does not exist', async () => {
  mocks.existsSyncMock.mockReturnValue(false);
  await createNotesFiles(params);
  expect(mocks.mkdirMock).toHaveBeenCalled();
});

test('Do not create release-nnotes directory when it exists', async () => {
  await createNotesFiles(params);
  expect(mocks.mkdirMock).not.toHaveBeenCalled();
});

test('parse provided release notes as expected', async () => {
  await createNotesFiles(params);
  expect(mocks.writeFileMock).toBeCalledWith('./static/release-notes/1.0.json', JSON.stringify(jsonResult));
});
