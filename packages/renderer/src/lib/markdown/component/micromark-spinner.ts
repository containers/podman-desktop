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
 * It allows to create a spinner to be associated to another object ('owner') so the spinner state is changed based on its owner behavior
 * E.g if a button (owner) is clicked and the action start executing we can enabled the spinner
 */
import { type MicromarkSpinner } from '../micromark-utils';

let spinnerCount = 0;
const spinners = new Map<string, MicromarkSpinner>();

/**
 * it creates a new spinner id, associate the command to it and returns the spinner icon
 * @param ownerId id of the element which the spinner belong to
 * @returns spinner icon
 */
export function createSpinner(ownerId: string): string {
  // create new id
  const spinnerId = newSpinnerId();
  // generate new spinner icon
  const icon = generateSpinnerIcon(spinnerId);
  // save spinner and associate it to the owner element
  // e.g a button, when this will be clicked, by using its id we can retrieve the spinner and toggle its state
  spinners.set(ownerId, {
    id: spinnerId,
    icon,
    enabled: false,
  });
  return icon;
}

/**
 * generate the new spinner id
 * @returns spinner id
 */
function newSpinnerId() {
  // update spinner number and create a new id
  ++spinnerCount;
  return `micromark-spinner-${spinnerCount}`;
}

/**
 * make the spinner visible
 * @param ownerId id of the element which the spinner belong to
 */
export function enableSpinner(ownerId: string) {
  toggleElementSpinner(ownerId, true);
}

/**
 * hide the spinner
 * @param ownerId id of the element which the spinner belong to
 */
export function disableSpinner(ownerId: string) {
  toggleElementSpinner(ownerId, false);
}

/**
 * it changes the visibility of the spinner based on its owner id
 * @param ownerId id of the element which the spinner belong to
 * @param enabled if must be visible
 */
function toggleElementSpinner(ownerId: string, enabled: boolean) {
  const spinner = spinners.get(ownerId);
  if (spinner) {
    const spinnerElement = document.getElementById(spinner.id);
    if (spinnerElement) {
      spinnerElement.style.display = enabled ? 'inline-block' : 'none';
    }
    spinner.enabled = !spinner.enabled;
  }
}

/**
 * generate a new spinner icon with a custom id
 * @param id id of the new spinner
 * @returns the spinner icon
 */
function generateSpinnerIcon(id: string) {
  return `
        <i id='${id}' class='flex justify-center items-center mr-2' style='display: none;'>
            <svg width='1em' height='1em' viewBox='0 0 100 100'>
            <defs>
                <linearGradient id='grad1' x1='0%' y1='0%' x2='0%' y2='100%'>
                <stop offset='0%' style='stop-color:rgb(0,0,0);stop-opacity:1'></stop>
                <stop offset='60%' style='stop-color:rgb(0,0,0);stop-opacity:1'></stop>
                <stop offset='100%' style='stop-color:rgb(255,255,255);stop-opacity:1'></stop>
                </linearGradient>
            </defs>
            <mask id='myMask'>
                <rect x='0' y='0' width='100' height='100' fill='white'></rect>
                <rect x='-25' y='-25' width='150' height='75' fill='black'></rect>
                <g transform='translate(50,50)' style='width='1em'; height='1em''>
                <g>
                    <rect x='-75' y='-75' width='150' height='75' fill='url(#grad1)'></rect>
                    <rect x='-75' y='-70' width='100' height='75' fill='black'></rect>
                    <animateTransform
                    attributeName='transform'
                    type='rotate'
                    dur='1.5s'
                    from='0'
                    to='180'
                    values='0; 140;180; 140; 0'
                    keyTimes='0; 0.25;0.5; 0.75;1'
                    repeatCount='indefinite'></animateTransform>
                </g>
                </g>
            </mask>
            <circle
                cx='50'
                cy='50'
                r='46'
                stroke='currentColor'
                opacity='0.8'
                stroke-width='10'
                fill='transparent'
                mask='url(#myMask)'></circle>
            <animateTransform
                attributeName='transform'
                type='rotate'
                dur='3s'
                from='0'
                to='360'
                repeatCount='indefinite'
                values='0;90;180;270;360;450;540;630;720;810;900;990;1080;1170;1260;1350;1440;1530;1620;1710;1800'
                keyTimes='0; 0.02;0.08;0.18;0.32;0.375;0.42;0.455;0.48;0.495;0.5;0.52;0.58;0.68;0.82;0.875;0.92;0.955;0.98;0.995;1'
            ></animateTransform>
            </svg>
        </i>`;
}
