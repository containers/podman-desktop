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
import spinnerSourcecode from '@podman-desktop/ui-svelte/Spinner?raw';
import type { Directive } from 'micromark-extension-directive';

let spinnerHtmlCode: string | undefined = undefined;

/**
 * Allow to generate a custom button markdown directive
 * syntax is the following:
 * :button[Name of the button]{command=command.example title="tooltip text"}
 * or
 * :button[Name of the button]{href=http://my-link title="tooltip text"}
 */
/**
 * @this {import('micromark-util-types').CompileContext}
 * @type {import('micromark-extension-directive').Handle}
 */
export function button(d: Directive) {
  // Make sure it's not part of a text directive
  if (d.type !== 'textDirective') {
    return false;
  }

  // Make sure {command=example} has been passed in
  if (d.attributes && 'command' in d.attributes) {
    // Make this a button if it's a command
    this.tag(
      '<button class="px-4 py-[6px] rounded-[4px] text-white text-[13px] whitespace-nowrap bg-purple-600 hover:bg-purple-500 no-underline" data-command="' +
        this.encode(d.attributes.command) +
        '">',
    );

    // add a spinner wrapped in a div wrapper to show/hide spinner
    this.tag('<div class="mr-2 hidden">');
    this.tag(getSpinnerCode());
    this.tag('</div>');

    // Add any labels and close the button
    this.raw(d.label || '');
    this.tag('</button>');
  } else {
    // If href is passed in, make this an anchor tag but make it look like a button
    this.tag(
      '<a class="px-4 py-[6px] rounded-[4px] !text-white text-[13px] whitespace-nowrap bg-purple-600 hover:bg-purple-500 !no-underline"',
    );

    // Href & title
    if (d.attributes && 'href' in d.attributes) {
      this.tag(' href="' + this.encode(d.attributes.href) + '"');
    }
    if (d.attributes && 'title' in d.attributes) {
      this.tag(' title="' + this.encode(d.attributes.title) + '"');
    }

    // Add the closing tags + labels (if any)
    this.tag('>');
    this.raw(d.label || '');
    this.tag('</a>');
  }
}

// Grab the html code from the Spinner Component rather than copying the definition there
export function getSpinnerCode(): string {
  // if not yet defined, retrieve the html code from the component
  if (!spinnerHtmlCode) {
    // remove the first part of the string that containers <script>....</script> part
    spinnerHtmlCode = spinnerSourcecode.replace(/<script.*\/script>/gs, '');

    // replace the size
    spinnerHtmlCode = spinnerHtmlCode.replaceAll('{size}', '16px');
  }
  return spinnerHtmlCode;
}
