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

// Helper providing some methods to handle multi-lines / json

export function lines(object: { stdout: string }): string[] {
  if (!object.stdout) {
    return [];
  }
  // split all lines from the stdout
  return object.stdout.split(/\n/);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseJsonObject(object: { stdout: string }): any {
  if (!object.stdout) {
    return undefined;
  }
  let trimmed = object.stdout.trim();

  // remove the extra " " around the trimmed object if we have some
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    trimmed = trimmed.substring(1, trimmed.length - 1);
  }

  return JSON.parse(trimmed);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseJsonLines(object: { stdout: string }): any[] {
  // grab all lines that have some content
  const allLines = lines(object).filter(line => line.trim().length > 0);
  // parse each line as a JSON object
  return allLines.map(line => {
    // remove the extra " " around the trimmed object if we have some
    if (line.startsWith('"') && line.endsWith('"')) {
      line = line.substring(1, line.length - 1);
    }

    return JSON.parse(line);
  });
}
