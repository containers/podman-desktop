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

import * as fs from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as util from '../../util.js';
import type { DockerContextParsingInfo } from './docker-context-handler.js';
import { DockerContextHandler } from './docker-context-handler.js';

export class TestDockerContextHandler extends DockerContextHandler {
  override getDockerConfigPath(): string {
    return super.getDockerConfigPath();
  }

  override getCurrentContext(): Promise<string> {
    return super.getCurrentContext();
  }

  override getContexts(): Promise<DockerContextParsingInfo[]> {
    return super.getContexts();
  }
}

// mock exists sync
vi.mock('node:fs');

const originalConsoleError = console.error;
let dockerContextHandler: TestDockerContextHandler;

beforeEach(() => {
  vi.resetAllMocks();
  console.error = vi.fn();
  dockerContextHandler = new TestDockerContextHandler();
});

afterEach(() => {
  console.error = originalConsoleError;
});

test('getDockerConfigPath', async () => {
  const configPath = dockerContextHandler.getDockerConfigPath();
  expect(configPath).toEqual(join(homedir(), '.docker', 'config.json'));
});

describe('getCurrentContext', () => {
  test('should return default if docker config does not exist', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    const currentContext = await dockerContextHandler.getCurrentContext();
    expect(currentContext).toBe('default');
  });

  test('should return context if docker config exist', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue(JSON.stringify({ currentContext: 'test-context' }));

    const currentContext = await dockerContextHandler.getCurrentContext();
    expect(currentContext).toBe('test-context');
  });

  test('should return default if docker config exist but fails to parse it', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue('not a JSON');

    const currentContext = await dockerContextHandler.getCurrentContext();
    expect(currentContext).toBe('default');
    expect(console.error).toBeCalledWith('Error parsing docker config file', expect.any(Error));
  });
});

describe('switchContext', () => {
  test('should report an error if file does not exists', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    await expect(() => dockerContextHandler.switchContext('foo')).rejects.toThrowError('does not exist');
  });

  test('should throw error if context does not exists', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    vi.spyOn(dockerContextHandler, 'getContexts').mockResolvedValue([]);

    await expect(() => dockerContextHandler.switchContext('foo')).rejects.toThrowError('Context foo not found');
  });

  test('should write the content', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(dockerContextHandler, 'getContexts').mockResolvedValue([
      { name: 'foo' } as unknown as DockerContextParsingInfo,
      { name: 'bar' } as unknown as DockerContextParsingInfo,
    ]);
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue(JSON.stringify({ currentContext: 'bar' }));
    await dockerContextHandler.switchContext('foo');
    // check using the correct indentation
    expect(fs.promises.writeFile).toBeCalledWith(
      expect.any(String),
      JSON.stringify({ currentContext: 'foo' }, null, '\t'),
    );
  });

  test('should remove the entry when switching to default', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(dockerContextHandler, 'getContexts').mockResolvedValue([
      { name: 'default' } as unknown as DockerContextParsingInfo,
      { name: 'dummy' } as unknown as DockerContextParsingInfo,
    ]);
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue(JSON.stringify({ currentContext: 'dummy' }));
    await dockerContextHandler.switchContext('default');
    // check no currentContext field as we remove it
    expect(fs.promises.writeFile).toBeCalledWith(expect.any(String), JSON.stringify({}, null, '\t'));
  });

  test('should throw error if JSON is invalid', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(dockerContextHandler, 'getContexts').mockResolvedValue([
      { name: 'foo' } as unknown as DockerContextParsingInfo,
      { name: 'bar' } as unknown as DockerContextParsingInfo,
    ]);
    vi.spyOn(fs.promises, 'readFile').mockResolvedValue('not a json');

    await expect(() => dockerContextHandler.switchContext('foo')).rejects.toThrowError(
      'Error parsing docker config file',
    );
  });
});

describe('listContexts', () => {
  test('should add the extra isCurrentContext', async () => {
    vi.spyOn(dockerContextHandler, 'getCurrentContext').mockResolvedValue('bar');
    vi.spyOn(dockerContextHandler, 'getContexts').mockResolvedValue([
      { name: 'foo' } as unknown as DockerContextParsingInfo,
      { name: 'bar' } as unknown as DockerContextParsingInfo,
    ]);

    const contexts = await dockerContextHandler.listContexts();
    expect(contexts).toEqual([
      { name: 'foo', isCurrentContext: false },
      { name: 'bar', isCurrentContext: true },
    ]);
  });
});

describe('getContexts', () => {
  test('should return contexts if directory does not exists', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const contexts = await dockerContextHandler.getContexts();

    // expect no error
    expect(console.error).not.toBeCalled();
    // no read file
    expect(fs.promises.readFile).not.toBeCalled();
    expect(contexts.length).toBe(1); // default context in addition
    expect(contexts.find(c => c.name === 'default')).toBeDefined();
  });

  test('check default on Windows', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    vi.spyOn(util, 'isWindows').mockImplementation(() => true);

    const contexts = await dockerContextHandler.getContexts();

    const defaultContext = contexts.find(c => c.name === 'default');
    expect(defaultContext).toBeDefined();
    // check the path
    expect(defaultContext?.endpoints.docker.host).toBe('npipe:////./pipe/docker_engine');
  });

  test('should return contexts if error reading JSON', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs.promises, 'readdir').mockResolvedValue([
      {
        isDirectory: () => true,
        name: 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9',
      } as fs.Dirent,
      {
        isDirectory: () => true,
        name: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      } as fs.Dirent,
    ]);

    vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce('invalid JSON');
    vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(
      JSON.stringify({ Name: 'bar', Endpoints: { docker: { Host: 'foo' } } }),
    );

    const contexts = await dockerContextHandler.getContexts();

    // expect error while parsing
    expect(console.error).toBeCalledWith('Error parsing docker context meta file', expect.any(Error));
    expect(contexts.length).toBe(2); // default context in addition
    expect(contexts.find(c => c.name === 'default')).toBeDefined();
    expect(contexts.find(c => c.name === 'bar')).toBeDefined();
    // not there due to the error
    expect(contexts.find(c => c.name === 'foo')).toBeUndefined();
  });

  test('should return contexts if directory exists', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs.promises, 'readdir').mockResolvedValue([
      {
        isDirectory: () => true,
        name: 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9',
      } as fs.Dirent,
      {
        isDirectory: () => true,
        name: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      } as fs.Dirent,
    ]);

    vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify({ Name: 'foo' }));
    vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify({ Name: 'bar' }));

    const contexts = await dockerContextHandler.getContexts();

    // expect no error
    expect(console.error).not.toBeCalled();
    expect(contexts.length).toBe(3); // default context in addition
    expect(contexts.find(c => c.name === 'default')).toBeDefined();
    expect(contexts.find(c => c.name === 'foo')).toBeDefined();
    expect(contexts.find(c => c.name === 'bar')).toBeDefined();
  });

  test('should filter contexts if invalid sha', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs.promises, 'readdir').mockResolvedValue([
      { isDirectory: () => true, name: 'invalidsha' } as fs.Dirent,
      {
        isDirectory: () => true,
        name: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
      } as fs.Dirent,
    ]);

    vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify({ Name: 'foo' }));
    vi.spyOn(fs.promises, 'readFile').mockResolvedValueOnce(JSON.stringify({ Name: 'bar' }));

    const contexts = await dockerContextHandler.getContexts();

    // expect error
    expect(console.error).toBeCalledWith(
      'Context name bar does not match the directory name invalidsha. Found fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9',
    );

    // only 2 contexts as the one is filtered
    expect(contexts.length).toBe(2);
    expect(contexts.find(c => c.name === 'default')).toBeDefined();
    expect(contexts.find(c => c.name === 'foo')).toBeDefined();
    expect(contexts.find(c => c.name === 'bar')).not.toBeDefined();
  });
});
