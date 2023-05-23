#!/usr/bin/env node
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

import * as fs from 'node:fs';
import * as path from 'node:path';
import { Octokit } from 'octokit';
import type { OctokitOptions } from '@octokit/core/dist-types/types';

const octokitOptions: OctokitOptions = {};
if (process.env.GITHUB_TOKEN) {
  octokitOptions.auth = process.env.GITHUB_TOKEN;
}
const octokit = new Octokit(octokitOptions);

// to make this file a module
export {};

async function download(tagVersion: string, repoPath: string, fileName: string): Promise<void> {
  const destDir = path.resolve(__dirname, '..', 'src-generated');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }
}
