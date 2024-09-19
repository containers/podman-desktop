/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

// CheckingState indicates the state of the check for a context
export interface CheckingState {
  state: 'waiting' | 'checking' | 'gaveup';
}

// A selection of resources, to indicate the 'general' status of a context
type selectedResources = ['pods', 'deployments'];

// resources managed by podman desktop, excepted the primary ones
// This is where to add new resources when adding new informers
export const secondaryResources = [
  'services',
  'ingresses',
  'routes',
  'configmaps',
  'secrets',
  'nodes',
  'persistentvolumeclaims',
] as const;

export type SecondaryResourceName = (typeof secondaryResources)[number];
export type ResourceName = SelectedResourceName | SecondaryResourceName;

export type SelectedResourceName = selectedResources[number];

export type SelectedResourcesCount = {
  [resourceName in SelectedResourceName]: number;
};

// information sent: status and count of selected resources
export interface ContextGeneralState {
  checking?: CheckingState;
  error?: string;
  reachable: boolean;
  resources: SelectedResourcesCount;
}
