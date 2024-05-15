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

export function tabWithinParent(e: KeyboardEvent, parent: HTMLDivElement): void {
  // trap focus within parent element
  const nodes = parent.querySelectorAll<HTMLElement>('*');
  const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

  let index = tabbable.indexOf(document.activeElement as HTMLElement);
  if (index === -1 && e.shiftKey) index = 0;

  index += tabbable.length + (e.shiftKey ? -1 : 1);
  index %= tabbable.length;

  tabbable[index].focus();
  e.preventDefault();
}
