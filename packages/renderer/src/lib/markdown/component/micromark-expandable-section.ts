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
 * It allows to create an expandable section which consists of a toggle and a section which can be visible/hidden based on the toggle state
 */
import type { CompileContext } from 'micromark-util-types';

import type { ExpandableSection, ExpandableSectionProps } from '../micromark-utils';

let expandableCount = 0;
const expandables = new Map<string, ExpandableSection>();

const OPENED_STATE_TOGGLE_ICON = `<i class='fas fa-chevron-up text-gray-100 mr-1'></i>`;
const CLOSED_STATE_TOGGLE_ICON = `<i class='fas fa-chevron-down text-gray-100 mr-1'></i>`;

/**
 * it creates a new expandable section object
 * @param expandable property of the new expandable section
 * @returns the expandable section
 */
function createExpandableSectionElement(expandable: ExpandableSectionProps): ExpandableSection {
  const id = newExpandableId();
  const expandableElement = {
    ...expandable,
    id,
    toggleExpandedState: {
      icon: OPENED_STATE_TOGGLE_ICON,
      ...expandable.toggleExpandedState,
    },
    toggleCollapsedState: {
      icon: CLOSED_STATE_TOGGLE_ICON,
      ...expandable.toggleCollapsedState,
    },
  };
  expandables.set(id, expandableElement);
  return expandableElement;
}

/**
 * generate an id for an expandable section
 * @returns new id
 */
function newExpandableId(): string {
  // update toggle number and create a new id
  ++expandableCount;
  return `micromark-expandable-${expandableCount}`;
}

/**
 * it adds an expandable section (toggle + expandable/collapsable section) in the micromark directive context
 * @param this compile context used by the micromark directive
 * @param expandable the expandable section property to create the new expandable section ui element
 */
export function createExpandableSection(this: CompileContext, expandable: ExpandableSectionProps) {
  // create the expandable element from the data received
  const expandableElement = createExpandableSectionElement(expandable);

  // if the expandable is created expanded, the button needs to be in open state, otherwise it's closed
  const toggleState = expandableElement.content.expanded
    ? expandableElement.toggleExpandedState
    : expandableElement.toggleCollapsedState;

  // create button (icon + label)
  this.tag(
    `<button class='flex space-x-2 text-purple-400 w-fit hover:bg-white hover:bg-opacity-10 text-xs items-center' data-expandable='${
      expandableElement.id
    }' style='display: ${expandable.showToggle ? 'flex' : 'none'};' aria-label='${expandableElement.id}'>`,
  );
  this.tag(toggleState.icon);
  this.raw(toggleState.label);
  this.tag('</button>');

  // create expandable section
  this.tag(
    `<div class='flex-col w-[250px] text-sm ${expandableElement.id}' style='display: ${
      expandable.content.expanded ? 'flex' : 'none'
    };'>`,
  );
  this.tag(expandable.content.html);
  this.tag('</div>');
}

/**
 * it gets triggered when the toggle is clicked and the expandable section needs to be expanded/collapsed
 * @param id expandable section id
 */
export function executeExpandableToggle(id: string) {
  const expandable = expandables.get(id);
  if (expandable) {
    // update expanded state
    expandable.content.expanded = !expandable.content.expanded;
    // invoke the actual toggle expandable function
    toggleExpandableSection(expandable);
  }
}

/**
 * it updates the UI with the new expandable section state
 * @param expandable expandable section
 */
function toggleExpandableSection(expandable: ExpandableSection) {
  // retrieve info about the toggle (open/close icon + text) by looking at its expanded state
  const toggleState = expandable.content.expanded ? expandable.toggleExpandedState : expandable.toggleCollapsedState;

  // find toggle button
  const toggleHTMLElement = document.querySelector(`[data-expandable='${expandable.id}']`);
  // update the inner icon + text based on its expanded state
  if (toggleHTMLElement) {
    toggleHTMLElement.innerHTML = `${toggleState.icon}${toggleState.label}`;
  }
  // find the expanded panel and expand/collapse it based on the expanded state
  const expandedPanels = document.getElementsByClassName(expandable.id);
  if (expandedPanels?.length > 0) {
    const panel = expandedPanels[0] as HTMLElement;
    panel.style.display = expandable.content.expanded ? 'flex' : 'none';
  }
}

/**
 * show the expandable section toggle
 * @param ref id of the element that created the expandable section
 */
export function showExpandableToggleByRef(ref: string) {
  updateExpandableToggleVisibility(ref, true);
}

/**
 * hide the expandable section toggle
 * @param ref id of the element that created the expandable section
 */
export function hideExpandableToggleByRef(ref: string) {
  updateExpandableToggleVisibility(ref, false);
}

/**
 * update the visibility of the expandable section toggle
 * @param ref id of the element that created the expandable section
 * @param show if the toggle must be visible or hidden
 */
function updateExpandableToggleVisibility(ref: string, show: boolean) {
  for (const expandable of expandables.values()) {
    if (expandable.ref === ref) {
      expandable.showToggle = show;
      // find toggle button
      const toggleHTMLElement = document.querySelector(`[data-expandable='${expandable.id}']`);
      if (toggleHTMLElement) {
        // update the visibility
        (toggleHTMLElement as HTMLButtonElement).style.display = expandable.showToggle ? 'flex' : 'none';
      }
    }
  }
}

/**
 * update the content of the expandable section by using the ref property
 * @param ref id of the element that created the expandable section
 * @param html html to render inside the expandable section
 */
export function updateExpandableSectionHtmlContentByRef(ref: string, html: string) {
  for (const expandable of expandables.values()) {
    if (expandable.ref === ref) {
      expandable.content.html = html;
      // find toggle button
      // find the toggle panel and show/hide it based on the expanded state
      const expandableDivs = document.getElementsByClassName(expandable.id);
      if (expandableDivs?.length > 0) {
        const expandableDiv = expandableDivs[0] as HTMLElement;
        expandableDiv.innerHTML = expandable.content.html;
      }
    }
  }
}
