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
        '<button class="flex flex-row items-center justify-center px-4 py-[6px] rounded-[4px] text-white text-[13px] whitespace-nowrap bg-purple-600 hover:bg-purple-500 no-underline" data-command="' +
          this.encode(item.command.id) +
          '">',
      );

      // Add the "progress" spinner
      this.tag(
        `<i class="flex justify-center items-center mr-2" style="display: none;">
          <svg width="1em" height="1em" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:1"></stop>
                <stop offset="60%" style="stop-color:rgb(0,0,0);stop-opacity:1"></stop>
                <stop offset="100%" style="stop-color:rgb(255,255,255);stop-opacity:1"></stop>
              </linearGradient>
            </defs>
            <mask id="myMask">
              <rect x="0" y="0" width="100" height="100" fill="white"></rect>
              <rect x="-25" y="-25" width="150" height="75" fill="black"></rect>
              <g transform="translate(50,50)" style="width='1em'; height='1em'">
                <g>
                  <rect x="-75" y="-75" width="150" height="75" fill="url(#grad1)"></rect>
                  <rect x="-75" y="-70" width="100" height="75" fill="black"></rect>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    dur="1.5s"
                    from="0"
                    to="180"
                    values="0; 140;180; 140; 0"
                    keyTimes="0; 0.25;0.5; 0.75;1"
                    repeatCount="indefinite"></animateTransform>
                </g>
              </g>
            </mask>
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="currentColor"
              opacity="0.8"
              stroke-width="10"
              fill="transparent"
              mask="url(#myMask)"></circle>
            <animateTransform
              attributeName="transform"
              type="rotate"
              dur="3s"
              from="0"
              to="360"
              repeatCount="indefinite"
              values="0;90;180;270;360;450;540;630;720;810;900;990;1080;1170;1260;1350;1440;1530;1620;1710;1800"
              keyTimes="0; 0.02;0.08;0.18;0.32;0.375;0.42;0.455;0.48;0.495;0.5;0.52;0.58;0.68;0.82;0.875;0.92;0.955;0.98;0.995;1"
            ></animateTransform>
          </svg>
        </i>`,
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
