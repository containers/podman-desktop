/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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
import * as http from 'node:http';
import * as os from 'node:os';
import { isAbsolute, join } from 'node:path';

import * as extensionApi from '@podman-desktop/api';

const macosExtraPath = '/opt/podman/bin:/usr/local/bin:/opt/homebrew/bin:/opt/local/bin';

export function getKindPath(): string | undefined {
  const env = process.env;
  if (extensionApi.env.isMac) {
    if (!env.PATH) {
      return macosExtraPath;
    } else {
      return env.PATH.concat(':').concat(macosExtraPath);
    }
  } else {
    return env.PATH;
  }
}

/**
 * Take as input the stdout of `kind --version`
 * @param raw
 */
export function parseKindVersion(raw: string): string {
  if (raw.startsWith('kind version')) {
    return raw.substring(13);
  }
  throw new Error('malformed kind output');
}

/**
 * Return the version and the path of an executable
 * @param executable
 */
export async function getKindBinaryInfo(executable: string): Promise<{ version: string; path: string }> {
  // if absolute we do not include PATH
  if (isAbsolute(executable)) {
    const { stdout } = await extensionApi.process.exec(executable, ['--version']);
    return {
      version: parseKindVersion(stdout),
      path: executable,
    };
  } else {
    const kindPath = getKindPath() ?? '';
    const { stdout } = await extensionApi.process.exec(executable, ['--version'], { env: { PATH: kindPath } });
    return {
      version: parseKindVersion(stdout),
      path: await whereBinary(executable), // we need to where/which the executable to find its real path
    };
  }
}

/**
 * Given an executable name will find where it is installed on the system
 * @param executable
 */
export async function whereBinary(executable: string): Promise<string> {
  const kindPath = getKindPath() ?? '';
  // grab full path for Linux and mac
  if (extensionApi.env.isLinux || extensionApi.env.isMac) {
    try {
      const { stdout: fullPath } = await extensionApi.process.exec('which', [executable], { env: { PATH: kindPath } });
      return fullPath;
    } catch (err) {
      console.warn('Error getting full path', err);
    }
  } else if (extensionApi.env.isWindows) {
    // grab full path for Windows
    try {
      const { stdout: fullPath } = await extensionApi.process.exec('where.exe', [executable], {
        env: { PATH: kindPath },
      });
      // remove all line break/carriage return characters from full path
      return fullPath.replace(/(\r\n|\n|\r)/gm, '');
    } catch (err) {
      console.warn('Error getting full path', err);
    }
  }

  return executable;
}

export async function getMemTotalInfo(socketPath: string): Promise<number> {
  const versionUrl = {
    path: '/info',
    socketPath: socketPath,
  };

  interface Info {
    MemTotal: number;
  }

  return new Promise<number>((resolve, reject) => {
    const req = http.get(versionUrl, res => {
      const body: Buffer[] = [];
      res.on('data', chunk => {
        body.push(chunk);
      });

      res.on('end', (err: unknown) => {
        if (res.statusCode === 200) {
          try {
            resolve((JSON.parse(Buffer.concat(body).toString()) as Info).MemTotal);
          } catch (e) {
            reject(e);
          }
        } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
          reject(new Error(err.message));
        } else {
          reject(new Error(String(err)));
        }
      });
    });

    req.once('error', err => {
      reject(new Error(err.message));
    });
  });
}

export function removeVersionPrefix(version: string): string {
  return version.replace('v', '').trim();
}

/**
 * Returns a temp directory accessible from both the Flatpak sandbox and the host.
 * In Flatpak, /tmp is a private tmpfs, so we use ~/.cache/kind-tmp/ which is
 * shared via --filesystem=home.
 */
export async function getTempDir(): Promise<string> {
  if (process.env['FLATPAK_ID']) {
    const cacheHome = process.env['XDG_CACHE_HOME'] ?? join(os.homedir(), '.cache');
    const tmpDir = join(cacheHome, 'kind-tmp');
    await fs.promises.mkdir(tmpDir, { recursive: true });
    return tmpDir;
  }
  return os.tmpdir();
}
