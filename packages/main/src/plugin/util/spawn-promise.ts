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
import { spawn } from 'node:child_process';

export interface SpawnPromiseResult {
  stdout: string;
  exitCode: number;
  error?: string;
}

export async function spawnWithPromise(command: string, spawnArgs?: string[]): Promise<SpawnPromiseResult> {
  let exitCode = 0;
  try {
    const content = await new Promise<string>((resolve, reject) => {
      //  launch command
      const child = spawn(command, spawnArgs);
      let output = '';
      child.stdout.setEncoding('utf8');
      // collect output and append the result
      child.stdout.on('data', stdout => (output += stdout));
      child.on('error', reject);
      child.on('exit', code => {
        if (code) {
          exitCode = code;
          reject(
            new Error(
              `Unable to execute the command ${command} ${
                spawnArgs ? spawnArgs.join(' ') : ''
              }. Exited with code ${code}`,
            ),
          );
        } else {
          resolve(output);
        }
      });
    });

    // now, we have the content
    return { stdout: content, exitCode };
  } catch (error) {
    return { stdout: '', exitCode, error: '' + error };
  }
}
