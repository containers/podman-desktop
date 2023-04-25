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

/**
 * Allow to generate a custom button markdown directive
 * syntax is the following:
 * :button[Name of the button]{href=http://my-link title="tooltip text"}
 */

/**
 * @this {import('micromark-util-types').CompileContext}
 * @type {import('micromark-extension-directive').Handle}
 */
export function button(d) {
  if (d.type !== 'textDirective') {
    return false;
  }

  this.tag('<a class="pf-c-button pf-m-primary"');

  if (d.attributes && 'href' in d.attributes) {
    this.tag(' href="' + this.encode(d.attributes.href) + '"');
  }

  if (d.attributes && 'title' in d.attributes) {
    this.tag(' title="' + this.encode(d.attributes.title) + '"');
  }

  this.tag('>');
  this.raw(d.label || '');
  this.tag('</a>');
}
