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

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// this is the opposite of what happens in the micromark encode function
const characterReferences = { '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>' };

export function decode(value) {
  return value.replace(/(&quot;|&amp;|&gt;|&lt;)/g, replace);

  /**
   * @param {string} value
   * @returns {string}
   */
  function replace(value) {
    return characterReferences[value];
  }
}

/**
 * Allow to generate a link markdown directive that executes a command
 * syntax is the following:
 * :warnings[[{item}, {item}]]
 * where item is 
 * {
    state: string;
    description: string;
    command?: {
      id: string;
      title: string;
    }
    docDescription?: string;
    docLinks?: {
      title: string;
      url: string;
      group?: string;
    }[];
  }
 */
/**
 * @this {import('micromark-util-types').CompileContext}
 * @type {import('micromark-extension-directive').Handle}
 */
export function warnings(d: any) {
  // Make sure it's not part of a text directive
  if (d.type !== 'textDirective') {
    return false;
  }

  // Add the div tag which depicts the wrapper list containing all items
  this.tag('<div class="flex flex-col space-y-3">');

  const items = JSON.parse(decode(d.label) || '');
  for (const item of items) {
    // start the div representing one row
    this.tag('<div class="flex flex-row space-x-3 bg-charcoal-600 p-4 rounded-md items-center">');
    // add icon representing the warning status
    this.tag('<div class="mr-2 flex justify-center">');
    this.tag(item.state === 'successful' ? '✅' : '❌');
    this.tag('</div>');
    // add the warning description
    if (item.description) {
      // add title to the left
      this.tag('<div class="flex-grow">');
      this.raw(item.description);
      this.tag('</div>');
    }
    // add the command
    this.tag('<div class="w-[180px] pr-3 flex justify-center">');
    if (item.command) {
      // Make this a button
      this.tag(
        '<button class="px-4 py-[6px] rounded-[4px] text-white text-[13px] whitespace-nowrap bg-purple-600 hover:bg-purple-500 no-underline" data-command="' +
          this.encode(item.command.id) +
          '">',
      );

      // Add the "progress" spinner
      // TODO: Remove cloudfoundry to tailwind
      this.tag(
        '<i class="pf-c-button__progress" style="position: relative; margin-right:5px; display: none;"><span class="pf-c-spinner pf-m-sm" role="progressbar"><span class="pf-c-spinner__clipper">' +
          '</span><span class="pf-c-spinner__lead-ball"></span><span class="pf-c-spinner__tail-ball"></span></span></i>',
      );

      // Add any labels and close the button
      this.raw(item.command.title);
      this.tag('</button>');
    }
    this.tag('</div>');
    // add the description to be shown above the links
    this.tag('<div class="flex flex-col w-[250px] text-sm">');
    if (item.docDescription) {
      this.tag('<span>');
      this.raw(item.docDescription);
      this.tag('</span>');
    }
    // add links
    if (item.docLinks) {
      for (const link of item.docLinks) {
        this.tag('<a ');
        this.tag(' href="' + this.encode(link.url) + '"');
        this.tag(' title="' + this.encode(link.title) + '"');
        this.tag('>');
        this.raw(link.title);
        this.tag('</a>');
      }
    }
    // close links + description div
    this.tag('</div>');
    // close whole row div
    this.tag('</div>');
  }

  // close warnings component
  this.tag('</div>');
}
