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

import { executeButtonCommand } from './component/micromark-button';
import { executeExpandableToggle } from './component/micromark-expandable-section';

export function createListener(
  inProgressMarkdownCommandExecutionCallback: (
    command: string,
    state: 'starting' | 'failed' | 'successful',
    value?: unknown,
  ) => void,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (e: any) => {
    // Retrieve the command and expandable within the dataset
    const command = e.target.dataset.command;
    const expandable = e.target.dataset.expandable;

    // if the user click on a a href link containing data-pd-jump-in-page attribute
    if (e.target instanceof HTMLAnchorElement) {
      // get a matching attribute ?
      const hrefId = e.target.getAttribute('data-pd-jump-in-page');

      // get a linked ID
      if (hrefId) {
        const matchingElement = document.getElementById(hrefId);
        if (matchingElement) {
          matchingElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          });

          return;
        }
      }
    }

    // if the user clicked on the toggle of an expandable section
    if (expandable) {
      executeExpandableToggle(expandable);
      return;
    }

    // if the user clicked on a button (new way)
    if (!command && e.target instanceof HTMLButtonElement) {
      executeButtonCommand(e.target.id).catch((err: unknown) =>
        console.error(`Error executing command ${e.target.id}`, err),
      );
      return;
    }

    // Only check if the command exists and the target is not disabled
    if (command && !e.target.disabled) {
      // If the target is an instance of a button element, we know that we are going to execute either
      // a command or hyperlink
      if (e.target instanceof HTMLButtonElement) {
        // If the command exists and the button is not disabled, we execute the command
        // we'll also be updating the inProgressMarkdownCommandExecutionCallback so we have
        // real-time updates on the button
        inProgressMarkdownCommandExecutionCallback(command, 'starting');
        e.target.disabled = true;
        e.target.firstChild.style.display = 'inline-block';
        window
          .executeCommand(command)
          .then(value => inProgressMarkdownCommandExecutionCallback(command, 'successful', value))
          .catch((reason: unknown) => inProgressMarkdownCommandExecutionCallback(command, 'failed', reason))
          .finally(() => {
            e.target.disabled = false;
            e.target.firstChild.style.display = 'none';
          });
      } else if (e.target instanceof HTMLAnchorElement) {
        // Execute the command since it's a simple "link" to it
        // usually associated with a dialog / quickpick action.
        window.executeCommand(command).catch((reason: unknown) => console.error(String(reason)));
      }
    }
  };
}
