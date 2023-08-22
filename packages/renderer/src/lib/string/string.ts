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
export function splitSpacesHandlingDoubleQuotes(inputString: string): string[] {
  const tokens = [];
  let currentToken = '';
  let insideQuotes = false;

  for (const char of inputString) {
    if (char === ' ' && !insideQuotes) {
      if (currentToken !== '') {
        tokens.push(currentToken);
        currentToken = '';
      }
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else {
      currentToken += char;
    }
  }

  if (currentToken !== '') {
    tokens.push(currentToken);
  }

  return tokens;
}

export function quote(str: string): string {
  if (str.indexOf(' ') !== -1 && str.at(0) !== '"' && str.at(str.length - 1) !== '"') {
    return '"' + str + '"';
  }
  return str;
}

export function array2String(array: string[]): string {
  return array.map(str => quote(str)).join(' ');
}
