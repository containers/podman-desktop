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

import { promises } from 'node:fs';

export class EnvfileParser {
  async parseEnvFiles(envFiles: string[]): Promise<string[]> {
    const envFileContent = await Promise.all(
      envFiles.map(async envFile => {
        return this.parseEnvFile(envFile);
      }),
    );
    const envFileContentFlatten = envFileContent.flat();
    return envFileContentFlatten.filter(line => line !== '');
  }

  protected async parseEnvFile(envFile: string): Promise<string[]> {
    // check size of the file
    const stats = await promises.stat(envFile);
    if (stats.size > 1024 * 1024) {
      throw new Error(`Environment file ${envFile} is too big. Maximum size is 1MB.`);
    }

    const content = await promises.readFile(envFile, 'utf-8');

    // each lines should have the format KEY=VALUE or be empty
    // but it can have comments, but comments are using a # character preceded by a space

    const envVariables = [];
    // parse all the lines, one by one
    for (const line of content.split('\n')) {
      // skip empty lines and commented lines
      if (line !== '' && !line.startsWith('#')) {
        // clean up the value to remove comments
        const clearLine = this.envFileCleanEntry(line);

        if (!clearLine.key && !clearLine.value) {
          throw new Error(
            `Environment file ${envFile} is not a valid env file. Each line should have the format KEY=VALUE, value being optional. Found ${line}`,
          );
        }

        envVariables.push(`${clearLine.key}=${clearLine.value}`);
      }
    }

    return envVariables;
  }

  protected endOfChar(value: string, char: string): [boolean, number] {
    let endsWithChar = false;
    let index = 1;
    while (!endsWithChar && index < value.length) {
      if (value[index] === char && value[index - 1] !== '\\') {
        endsWithChar = true;
      } else {
        index++;
      }
    }
    return [endsWithChar, index];
  }

  protected envFileCleanEntry(entry: string): { key: string | undefined; value: string | undefined } {
    // do we have a = in the entry ?
    if (!entry.includes('=')) {
      return { key: undefined, value: undefined };
    }

    const [key, ...rest] = entry.split('=');
    const value = rest.join('=');

    let updatedValue = value;

    // do we have quotes around value ?
    if ((value?.startsWith('"') && value?.endsWith('"')) || (value?.startsWith(`'`) && value?.endsWith(`'`))) {
      // remove the quotes around
      updatedValue = value.substring(1, value.length - 1);
    } else if (value?.startsWith('"')) {
      // we have starting quotes, try to see where it ends without being an escaped quote like \'
      // iterate all the string to find the end of the quotes
      const endOfQuotes = this.endOfChar(value, '"');

      if (endOfQuotes[0]) {
        updatedValue = value.substring(1, endOfQuotes[1]);
      }
    } else if (value?.startsWith(`'`)) {
      const endOfSimpleQuotes = this.endOfChar(value, `'`);
      if (endOfSimpleQuotes[0]) {
        updatedValue = value.substring(1, endOfSimpleQuotes[1]);
      }
    } else {
      // if there is a comment, and that it is preceded by a space, remove it
      if (updatedValue.includes(' #')) {
        updatedValue = updatedValue.split(' #')[0] ?? '';
      }
    }

    return {
      key: key?.trim(),
      value: updatedValue?.replace(/\\"/g, '"'),
    };
  }
}
