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
 * It allows to create a button which has a spinner and an error log expandable section which gets visible if the command execution fails
 */
import type { CompileContext } from 'micromark-util-types';

import type { Command, ExpandableSectionProps } from '../micromark-utils';
import {
  createExpandableSection,
  hideExpandableToggleByRef,
  showExpandableToggleByRef,
  updateExpandableSectionHtmlContentByRef,
} from './micromark-expandable-section';
import { createSpinner, disableSpinner, enableSpinner } from './micromark-spinner';

let buttonCount = 0;
const buttons = new Map<string, ButtonElement>();

interface ButtonElement {
  id: string;
  command: Command;
  disabled: boolean;
}

const BASE_BUTTON_CSS =
  'flex flex-row items-center justify-center px-4 py-[6px] max-w-[200px] rounded-[4px] text-white text-[13px] whitespace-nowrap no-underline';
export const NORMAL_MODE_CSS = `${BASE_BUTTON_CSS} bg-purple-600 hover:bg-purple-500`;
export const ERROR_MODE_CSS = `${BASE_BUTTON_CSS} text-gray-400 bg-red-900 hover:bg-red-700`;

/**
 * it creates a new button by associating the command to it and returns its new generated button id
 * @param command command to execute when the button is clicked
 * @returns new button id
 */
function createButton(command: Command): string {
  // returns new id
  const id = newButtonId();
  const button: ButtonElement = {
    id,
    command,
    disabled: false,
  };
  // associate command to id
  buttons.set(id, button);
  return id;
}

/**
 * generate a new button id
 * @returns button id
 */
function newButtonId(): string {
  // update button number and create a new id
  ++buttonCount;
  return `micromark-button-${buttonCount}`;
}

/**
 * execute the command when the button is clicked
 *
 * when this function is invoked the button is disabled to prevent multiple click. The spinner is enabled and the command execution is invoked
 * if the command execution succeed the button state is reset to its normal mode
 * if the command execution fails the button goes in error mode - its color becomes red and a toggle to see all logs is displayed
 * @param buttonId button id
 */
export async function executeButtonCommand(buttonId: string) {
  const button = buttons.get(buttonId);
  if (button && !button.disabled) {
    // hide its expandable error log section if visible and reset button css
    disableErrorMode(button.id);
    // disable button
    disableButton(buttonId);
    // show spinner
    enableSpinner(buttonId);
    // execute command
    await window.executeCommand(button.command.id).catch((reason: unknown) => {
      // enable error mode (button style is updated, the log error content is updated with the error text and it is made visible)
      enableErrorMode(button.id, String(reason));
    });
    // hide spinner
    disableSpinner(buttonId);
    // re-enable button
    enableButton(buttonId);
  }
}

/**
 * create a panel with the error data received from the server
 * @param reason the reason why the command execution failed
 * @returns the html panel
 */
function createHtmlErrorContent(reason: string): string {
  // it uses inline style to constraint the height as tailwind max-height classes do not work with html injected
  return `
    <div class='bg-black text-sm overflow-y-auto overflow-x-auto p-3' style='height: 150px'>
    ${reason}
    </div>
    `;
}

/**
 * enable the button
 * @param id button id
 */
function enableButton(id: string) {
  updateButtonState(id, false);
}

/**
 * disable the button
 * @param id button id
 */
function disableButton(id: string) {
  updateButtonState(id, true);
}

/**
 * enable/disable the button based on the disabled param
 * @param id button id
 * @param disabled if the button has to be disabled
 */
function updateButtonState(id: string, disabled: boolean) {
  const button = buttons.get(id);
  if (button) {
    button.disabled = disabled;
    const buttonElement = document.getElementById(id);
    if (buttonElement) {
      (buttonElement as HTMLButtonElement).disabled = button.disabled;
    }
  }
}

/**
 * it enables the error mode. The button is colored in red, the expandable section which contains the log error is made visible
 * @param id button id
 * @param error the error log data to show in the expandable section
 */
function enableErrorMode(id: string, error: string) {
  //updates the style applied to the button
  toggleButtonMode(id, true);
  // update its content with the error received
  updateExpandableSectionHtmlContentByRef(id, createHtmlErrorContent(error));
  // show the error log section
  showExpandableToggleByRef(id);
}

/**
 * it disable the error mode so the button is reset to its normal state (purple color, hide expandable section)
 * @param id button id
 */
function disableErrorMode(id: string) {
  //updates the style applied to the button
  toggleButtonMode(id, false);
  // hide the error log section
  hideExpandableToggleByRef(id);
}

function toggleButtonMode(id: string, isErrorMode: boolean) {
  const button = buttons.get(id);
  if (button) {
    const buttonElement = document.getElementById(id);
    if (buttonElement) {
      // we retrieve all children of the button to update them (spinnericon, error icon, text)
      const buttonChildren = buttonElement.childNodes;
      // last child is the text
      buttonChildren[buttonChildren.length - 1].textContent = `${button.command.title}${isErrorMode ? ' failed' : ''}`;
      // update the css of the button
      const classes = isErrorMode
        ? buttonElement.className.replace(NORMAL_MODE_CSS, ERROR_MODE_CSS)
        : buttonElement.className.replace(ERROR_MODE_CSS, NORMAL_MODE_CSS);
      buttonElement.className = classes;
      // change visibility of error icon
      (buttonChildren[buttonChildren.length - 2] as HTMLElement).style.display = isErrorMode ? 'flex' : 'none';
    }
  }
}

/**
 * it adds a button and all its feature in the micromark directive context
 * @param this compile context used by the micromark directive
 * @param command the command to be associated to the new button, so when its clicked it start the command execution
 */
export function createUIButton(this: CompileContext, command: Command) {
  const buttonId = createButton(command);
  this.tag(
    `<button 
      id='${buttonId}' 
      class='${NORMAL_MODE_CSS}'
      title='${command.title}'
    >`,
  );

  // Add the 'progress' spinner
  this.tag(createSpinner(buttonId));

  // add the failed icon which gets visible in error mode
  this.tag(`<i id='${buttonId}-failed-icon' class='fas fa-times text-gray-100 mr-1' style='display: none'></i>`);

  // Add the command title
  this.raw(command.title);
  this.tag('</button>');

  // add the expandable section which will contains the error logs if the command execution fails
  const expandable: ExpandableSectionProps = {
    toggleExpandedState: {
      label: 'Error Log',
    },
    toggleCollapsedState: {
      label: 'Error Log',
    },
    content: {
      html: 'error',
      expanded: false,
    },
    ref: buttonId,
    showToggle: false,
  };
  createExpandableSection.bind(this)(expandable);
}
