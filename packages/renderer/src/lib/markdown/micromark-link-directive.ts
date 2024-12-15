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
import type { Directive } from 'micromark-extension-directive';

/**
 * Allow to generate a link markdown directive that executes a command
 * syntax is the following:
 * :link[Name of the command link]{command=command.example title="tooltip text"}
 * or
 * :link[Name of the command link]{href=http://my-link title="tooltip text"}
 */
/**
 * @this {import('micromark-util-types').CompileContext}
 * @type {import('micromark-extension-directive').Handle}
 */
export function link(d: Directive) {
  // Make sure it's not part of a text directive
  if (d.type !== 'textDirective') {
    return false;
  }

  // Add the anchor tag
  this.tag('<a ');

  // If it's a command {command=example} add the data-command attribute,
  // otherwise add the href {href=https://foobar.com} attribute
  if (d.attributes && 'command' in d.attributes) {
    this.tag(' data-command="' + this.encode(d.attributes.command) + '"');
  } else if (d.attributes && 'href' in d.attributes) {
    this.tag(' href="' + this.encode(d.attributes.href) + '"');
  }

  // Add the title attribute if it's passed in
  if (d.attributes && 'title' in d.attributes) {
    this.tag(' title="' + this.encode(d.attributes.title) + '"');
  }

  // Close the tags and add the label (if any)
  this.tag('>');
  this.raw(d.label || '');
  this.tag('</a>');
}
