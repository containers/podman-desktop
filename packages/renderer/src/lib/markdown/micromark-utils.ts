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

export interface ExpandableSectionToggle {
  readonly label: string;
}

export interface ExpandedExpandableSectionToggle extends ExpandableSectionToggle {
  readonly icon: string;
}

export interface CollapsedExpandableSectionToggle extends ExpandableSectionToggle {
  readonly icon: string;
}

export interface ExpandableSectionContent {
  html: string;
  // it defines if the section containing the html must be visible
  expanded: boolean;
}

export interface ExpandableSectionProps {
  toggleExpandedState: ExpandableSectionToggle;
  toggleCollapsedState: ExpandableSectionToggle;
  content: ExpandableSectionContent;
  // it defines if the toggle must be visible or not
  showToggle: boolean;
  /*
     it lets you reference an element id that's not needed for rendering, but it can be used to identify a relationship 
     (e.g a button with an expandable section that display command error)
    */
  ref?: string;
}

export interface ExpandableSection extends ExpandableSectionProps {
  id: string;
  toggleExpandedState: ExpandedExpandableSectionToggle;
  toggleCollapsedState: CollapsedExpandableSectionToggle;
}

export interface Command {
  id: string;
  title: string;
}

export interface MicromarkSpinner {
  id: string;
  icon: string;
  enabled: boolean;
}
