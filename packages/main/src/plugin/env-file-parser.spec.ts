/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-escape */

import { promises } from 'node:fs';

import { beforeAll, describe, expect, test, vi } from 'vitest';

import { EnvfileParser } from './env-file-parser.js';

let envfileParser: TestEnvfileParser;

beforeAll(() => {
  envfileParser = new TestEnvfileParser();
});

class TestEnvfileParser extends EnvfileParser {
  public async parseEnvFile(envFile: string): Promise<string[]> {
    return super.parseEnvFile(envFile);
  }

  public envFileCleanEntry(entry: string): { key: string | undefined; value: string | undefined } {
    return super.envFileCleanEntry(entry);
  }
}

// using https://docs.docker.com/compose/environment-variables/env-file/ checks
describe('check values', () => {
  test('simple value', () => {
    const item = 'VAR=VAL';

    const result = envfileParser.envFileCleanEntry(item);

    expect(result.key).toBe('VAR');
    expect(result.value).toBe('VAL');
  });

  test('simple value with quotes', () => {
    const item = `VAR="VAL"`;

    const result = envfileParser.envFileCleanEntry(item);

    expect(result.key).toBe('VAR');
    expect(result.value).toBe('VAL');
  });

  test('simple value with simple quotes', () => {
    const item = `VAR='VAL'`;

    const result = envfileParser.envFileCleanEntry(item);

    expect(result.key).toBe('VAR');
    expect(result.value).toBe('VAL');
  });

  test('simple value with inline comments', () => {
    const item = `VAR=VAL # comment`;

    const result = envfileParser.envFileCleanEntry(item);

    expect(result.key).toBe('VAR');
    expect(result.value).toBe('VAL');
  });

  test('simple value with not an inline comment as missing space', () => {
    const item = `VAR=VAL# not a comment`;

    const result = envfileParser.envFileCleanEntry(item);

    expect(result.key).toBe('VAR');
    expect(result.value).toBe('VAL# not a comment');
  });

  test('simple value Inline comments for quoted values must follow the closing quote', () => {
    const item = `VAR="VAL # not a comment"`;

    const result = envfileParser.envFileCleanEntry(item);

    expect(result.key).toBe('VAR');
    expect(result.value).toBe('VAL # not a comment');
  });

  test('simple value Inline comments for quoted values without follow the closing quote', () => {
    const item = `VAR="VAL" # comment`;

    const result = envfileParser.envFileCleanEntry(item);

    expect(result.key).toBe('VAR');
    expect(result.value).toBe('VAL');
  });

  test('simple value Inline comments for quoted values must follow the closing simple quote', () => {
    const item = `VAR='VAL # not a comment'`;

    const result = envfileParser.envFileCleanEntry(item);

    expect(result.key).toBe('VAR');
    expect(result.value).toBe('VAL # not a comment');
  });

  test('simple value Inline comments for quoted values without follow the closing simple quote', () => {
    const item = `VAR='VAL' # comment`;

    const result = envfileParser.envFileCleanEntry(item);

    expect(result.key).toBe('VAR');
    expect(result.value).toBe('VAL');
  });

  test('simple value single quotes values are used literally', () => {
    const item = `VAR='$OTHER'`;
    const result = envfileParser.envFileCleanEntry(item);
    expect(result.key).toBe('VAR');
    expect(result.value).toBe('$OTHER');
  });

  test('simple value single quotes values are used literally bis', () => {
    const item = `VAR='\${OTHER}'`;
    const result = envfileParser.envFileCleanEntry(item);
    expect(result.key).toBe('VAR');
    expect(result.value).toBe('${OTHER}');
  });

  test('simple quotes can be escaped with \\', () => {
    const item = `VAR='Let\'s go!'`;
    const result = envfileParser.envFileCleanEntry(item);
    expect(result.key).toBe('VAR');
    expect(result.value).toBe(`Let's go!`);
  });

  test('simple quotes can be escaped with \\ json', () => {
    const item = `VAR="{\"hello\": \"json\"}"`;
    const result = envfileParser.envFileCleanEntry(item);
    expect(result.key).toBe('VAR');
    expect(result.value).toBe(`{"hello": "json"}`);
  });
});

test('check parseEnvFile', async () => {
  const content = 'HI=FOO\nHELLO=WORLD';

  const readFileMock = vi.spyOn(promises, 'readFile');
  readFileMock.mockResolvedValue(content);

  const statsFileMock = vi.spyOn(promises, 'stat');
  statsFileMock.mockResolvedValue({ size: 100 } as any);

  const result = await envfileParser.parseEnvFile('foo');

  expect(result).toEqual(['HI=FOO', 'HELLO=WORLD']);
});

test('check parseEnvFiles', async () => {
  const content1 = 'HI=FOO\nHELLO=WORLD';
  const content2 = 'ANOTHER=\nYETANOTHER=VALUE';

  const readFileMock = vi.spyOn(promises, 'readFile');
  readFileMock.mockResolvedValueOnce(content1);
  readFileMock.mockResolvedValueOnce(content2);

  const statsFileMock = vi.spyOn(promises, 'stat');
  statsFileMock.mockResolvedValue({ size: 100 } as any);

  const result = await envfileParser.parseEnvFiles(['foo1', 'foo2']);

  expect(result).toEqual(['HI=FOO', 'HELLO=WORLD', 'ANOTHER=', 'YETANOTHER=VALUE']);
});

test('check parseEnvFile with comments', async () => {
  const content1 = 'HI=FOO\n# this is a commented line\nHELLO=WORLD';

  const readFileMock = vi.spyOn(promises, 'readFile');
  readFileMock.mockResolvedValue(content1);

  const statsFileMock = vi.spyOn(promises, 'stat');
  statsFileMock.mockResolvedValue({ size: 100 } as any);

  const result = await envfileParser.parseEnvFile('foo1');

  expect(result).toEqual(['HI=FOO', 'HELLO=WORLD']);
});

test('check parseEnvFile and expect error with a file too big', async () => {
  // big file
  const statsFileMock = vi.spyOn(promises, 'stat');
  statsFileMock.mockResolvedValue({ size: 2048 * 1024 } as any);

  await expect(envfileParser.parseEnvFile('foo')).rejects.toThrowError(
    'Environment file foo is too big. Maximum size is 1MB.',
  );
});

test('check parseEnvFile and expect error with invalid entries', async () => {
  // big file
  const statsFileMock = vi.spyOn(promises, 'stat');
  statsFileMock.mockResolvedValue({ size: 1024 } as any);

  const content = 'hello world';
  const readFileMock = vi.spyOn(promises, 'readFile');
  readFileMock.mockResolvedValueOnce(content);

  await expect(envfileParser.parseEnvFile('foo')).rejects.toThrowError(
    'Environment file foo is not a valid env file. Each line should have the format KEY=VALUE, value being optional.',
  );
});
