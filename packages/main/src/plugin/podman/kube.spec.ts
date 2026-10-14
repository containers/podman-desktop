/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import { existsSync } from 'node:fs';
import path from 'node:path';

import type { Headers, Pack, PackOptions } from 'tar-fs';
import tar from 'tar-fs';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import { getImageNamePrefix, KubePlayContext } from '/@/plugin/podman/kube.js';

vi.mock(import('node:fs'));
vi.mock(import('node:fs/promises'));
vi.mock(import('tar-fs'));

beforeEach(() => {
  vi.resetAllMocks();
});

test.each([
  {
    image: 'foobar',
    expected: 'foobar',
  },
  {
    image: 'foobar:latest',
    expected: 'foobar',
  },
  {
    image: 'foo/bar:latest',
    expected: 'bar',
  },
  {
    image: 'aa/bb/cc:latest',
    expected: 'cc',
  },
  {
    image: 'foo/bar',
    expected: 'bar',
  },
  {
    image: 'foo@bar',
    expected: 'foo',
  },
  {
    image: 'foo@bar:latest',
    expected: 'foo',
  },
])('expect $image to be $expected', ({ image, expected }) => {
  const result = getImageNamePrefix(image);
  expect(result).toBe(expected);
});

const PLAY_POD_YAML = `apiVersion: v1
kind: Pod
metadata:
  name: demo-build-remote
spec:
  containers:
    - name: container
      image: foobar
      ports:
        - name: http
          containerPort: 80
`;

const PLAY_MULTI_YAML = `apiVersion: v1
kind: Pod
metadata:
  name: demo-build-remote
spec:
  containers:
    - name: container-0
      image: foo
      ports:
        - name: http
          containerPort: 80
    - name: container-1
      image: bar
---
apiVersion: v1
kind: Service
metadata:
  name: demo-service
spec:
  selector:
    name: demo-build-remote
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 8080
---
apiVersion: v1
kind: Pod
metadata:
  name: demo-build-remote-2
spec:
  containers:
    - name: container
      image: foo
`;

describe('KubePlayContext', () => {
  test('calling getBuildContexts with non-initialized should throw an error', async () => {
    const kube = KubePlayContext.fromContent('foo', 'bar');

    expect(() => {
      kube.getBuildContexts();
    }).toThrowError('KubePlayContext must be initialized');
  });

  test('analyse should check for container file', async () => {
    const kube = KubePlayContext.fromContent(PLAY_POD_YAML, 'foo-bar');
    await kube.init();

    // should check for possible container file
    expect(existsSync).toHaveBeenCalledWith(path.join('foo-bar', 'foobar', 'Containerfile'));
    expect(existsSync).toHaveBeenCalledWith(path.join('foo-bar', 'foobar', 'Dockerfile'));
  });

  test('existing Containerfile should consider as valid build context', async () => {
    vi.mocked(existsSync).mockReturnValue(true);

    const kube = KubePlayContext.fromContent(PLAY_POD_YAML, 'foo-bar');
    await kube.init();

    expect(existsSync).toHaveBeenCalledWith(path.join('foo-bar', 'foobar', 'Containerfile'));

    const contexts = kube.getBuildContexts();
    expect(contexts).toHaveLength(1);
    expect(contexts[0]).toStrictEqual(path.join('foo-bar', 'foobar'));
  });

  test('multi resources object should be properly analysed', async () => {
    // mock only two time
    vi.mocked(existsSync).mockReturnValueOnce(true);
    vi.mocked(existsSync).mockReturnValueOnce(true);

    const kube = KubePlayContext.fromContent(PLAY_MULTI_YAML, 'foo-bar');
    await kube.init();

    const contexts = kube.getBuildContexts();
    expect(contexts).toHaveLength(2);
    expect(contexts[0]).toStrictEqual(path.join('foo-bar', 'foo'));
    expect(contexts[1]).toStrictEqual(path.join('foo-bar', 'bar'));
  });

  test('build should pack existing contexts', async () => {
    // mock only two time
    vi.mocked(existsSync).mockReturnValueOnce(true);
    vi.mocked(existsSync).mockReturnValueOnce(true);

    const kube = KubePlayContext.fromContent(PLAY_MULTI_YAML, 'foo-bar');
    await kube.init();

    kube.build();

    // 1. tar.pack should have been called properly
    expect(tar.pack).toHaveBeenCalledWith('foo-bar', {
      finalize: false,
      entries: ['foo', 'bar'],
      map: expect.any(Function),
      finish: expect.any(Function),
    });

    // 2. the finish callback should add the play.yaml as per spec
    // https://docs.podman.io/en/latest/_static/api.html#tag/containers/operation/PlayKubeLibpod
    const { finish } = vi.mocked(tar.pack).mock.calls[0]?.[1] as PackOptions;
    const streamMock: Pack = {
      entry: vi.fn(),
      finalize: vi.fn(),
    } as unknown as Pack;

    // calling the finish with a mock to ensure expected behavior
    finish?.(streamMock);

    // ensure entry is added
    expect(streamMock.entry).toHaveBeenCalledWith(
      {
        name: 'play.yaml',
      },
      PLAY_MULTI_YAML,
    );
    // ensure finalize is called
    expect(streamMock.finalize).toHaveBeenCalledOnce();
  });

  test('build should reset ownership of packed entries to root', async () => {
    vi.mocked(existsSync).mockReturnValue(true);

    const kube = KubePlayContext.fromContent(PLAY_POD_YAML, 'foo-bar');
    await kube.init();

    kube.build();

    const map = vi.mocked(tar.pack).mock.calls[0]?.[1]?.map;
    assert(map);

    // a uid/gid outside the rootless user namespace (e.g. above the 262143 tar header limit)
    const header: Headers = {
      name: 'foobar',
      mode: 0o755,
      mtime: new Date(0),
      size: 0,
      type: 'directory',
      uid: 300000,
      gid: 300000,
    };

    expect(map(header)).toStrictEqual({ ...header, uid: 0, gid: 0 });
  });
});
