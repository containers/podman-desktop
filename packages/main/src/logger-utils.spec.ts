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

import { test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { archiveLogs } from './logger-utils';

test('Should create archive with log files', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-'));
  fs.appendFileSync(path.join(tmpDir, 'a.log'), 'data to append', 'utf8');
  fs.appendFileSync(path.join(tmpDir, 'b.log'), 'data to append', 'utf8');
  fs.mkdirSync(path.join(tmpDir, 'c'));
  fs.appendFileSync(path.join(tmpDir, 'c', 'c.log'), 'data to append', 'utf8');

  const archivePath = await archiveLogs(path.join(tmpDir, 'a.log'), path.join(tmpDir, 'b.log'), path.join(tmpDir, 'c'));

  expect(fs.existsSync(archivePath)).toBeTruthy();

  fs.rmSync(tmpDir, { recursive: true });
});
