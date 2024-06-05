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

import type { CompileContext } from 'micromark-util-types';

import { createUIButton } from './component/micromark-button';
import { createExpandableSection } from './component/micromark-expandable-section';
import type { ExpandableSectionProps } from './micromark-utils';

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// this is the opposite of what happens in the micromark encode function
const characterReferences = new Map([
  ['&quot;', '"'],
  ['&amp;', '&'],
  ['&lt;', '<'],
  ['&gt;', '>'],
]);

export function decode(value: string) {
  return value.replace(/(&quot;|&amp;|&gt;|&lt;)/g, replace);

  /**
   * @param {string} value
   * @returns {string}
   */
  function replace(value: string) {
    return characterReferences.get(value) ?? '';
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
 * @type {import('micromark-extension-directive').Handle}
 */
export function warnings(this: CompileContext, d: any) {
  // Make sure it's not part of a text directive
  if (d.type !== 'textDirective') {
    return false;
  }

  // Add the div tag which depicts the wrapper list containing all items
  this.tag('<div class="flex flex-col space-y-3">');

  const items = JSON.parse(decode(d.label) ?? '');
  for (const item of items) {
    // start the div representing one row
    this.tag('<div class="flex flex-row space-x-3 bg-charcoal-600 p-4 rounded-md items-start">');
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

    // create the documentation content (text + links), if any
    let docContent = '';
    if (item.docDescription) {
      docContent += `
        <span>
        ${item.docDescription}
        </span>
      `;
    }
    // add links
    if (item.docLinks) {
      for (const link of item.docLinks) {
        docContent += `
          <a href="${this.encode(link.url)}" title="${this.encode(link.title)}">
          ${link.title}
          </a>
        `;
      }
    }

    // add the right column containing the command and the description + links
    this.tag('<div class="flex flex-col space-y-2 w-[250px] pr-3 flex">');
    if (item.command) {
      // Make this a button
      createUIButton.bind(this)({
        id: item.command.id,
        title: item.command.title,
      });

      // if there is additional content to show, we create an expandable section
      if (docContent !== '') {
        const expandable: ExpandableSectionProps = {
          showToggle: true,
          toggleExpandedState: {
            label: 'Less information',
          },
          toggleCollapsedState: {
            label: 'More information',
          },
          content: {
            html: docContent,
            expanded: false,
          },
        };
        createExpandableSection.bind(this)(expandable);
      }
    } else if (docContent !== '') {
      // there is no command, so the doc content has full visibility
      this.tag(docContent);
    }

    // close right column
    this.tag('</div>');

    // close whole row div
    this.tag('</div>');
  }

  // close warnings component
  this.tag('</div>');
}
