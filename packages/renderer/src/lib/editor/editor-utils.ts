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

// An array of readable ANSI escape sequence colours against a black terminal background
// these are the most "readable" colours against a black background
// No colours like grey, normal blue (cyan instead) or red, since they don't appear very well.
export const ansi256Colours = [
  '\u001b[36m', // cyan
  '\u001b[33m', // yellow
  '\u001b[32m', // green
  '\u001b[35m', // magenta
  '\u001b[34m', // blue
  '\u001b[36;1m', // bright cyan
  '\u001b[33;1m', // bright yellow
  '\u001b[32;1m', // bright green
  '\u001b[35;1m', // bright magenta
  '\u001b[34;1m', // bright blue
];

// Function that takes the container name and ANSI colour and encapsulates the name in the colour,
// making sure that we reset the colour back to white after the name.
export function colourizedANSIContainerName(name: string, colour: string) {
  return `${colour}${name}\u001b[0m`;
}
