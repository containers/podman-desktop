/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { IDisposable } from '@desktop-framework/api';
import type { CoreV1Event, KubernetesObject } from '@kubernetes/client-node';
import type { Readable, Unsubscriber } from 'svelte/store';

import { isKubernetesExperimentalMode, listenResources } from './resources-listen';

export interface ListenResourceOptions {
  // plural name of the resource to listen
  resourceName: string;
  // name of the specific resource to listen
  name: string;
  // namespace to undefined to search non-namespaced resource
  namespace?: string;
  // set to true to handle events attached to the resource
  listenEvents?: boolean;

  // stores to be set for non-experimental mode
  legacyResourceStore?: Readable<KubernetesObject[]>;
  legacyEventsStore?: Readable<KubernetesObject[]>;

  // called when the resource is not found
  onResourceNotFound: () => void;
  // called every time the resource is updated
  onResourceUpdated: (resource: KubernetesObject, experimental: boolean) => void;
  // called every time events attached to the resource are updated
  onEventsUpdated?: (events: CoreV1Event[]) => void;
}

/** listenResource listens for a specific resource (resourceName, name, namespace)
 *  and fires events when:
 *  - the resource is not found
 *  - the resource is updated (will send the resource without managedFields)
 *  - the events attached to the resource are updated, optionally
 */
export async function listenResource(options: ListenResourceOptions): Promise<IDisposable | undefined> {
  let resourcesListener: IDisposable | undefined;
  let eventsListener: IDisposable | undefined;

  let resourcesUnsubscriber: Unsubscriber;
  let eventsUnsubscriber: Unsubscriber;

  let allEvents: KubernetesObject[] = [];
  let resource: KubernetesObject | undefined;

  const refreshEvents = (): void => {
    if (options.listenEvents) {
      const events = allEvents
        .map(ev => (isCoreV1Event(ev) ? ev : undefined))
        .filter(ev => !!ev)
        .filter(ev => ev.involvedObject.uid === resource?.metadata?.uid);
      options.onEventsUpdated?.(events);
    }
  };

  const onUpdatedResources = (updatedResources: KubernetesObject[]): void => {
    const matchingResource = updatedResources.find(
      srv =>
        srv.metadata?.name === options.name && (!options.namespace || srv.metadata?.namespace === options.namespace),
    );
    if (matchingResource) {
      resource = matchingResource;
      const kubeResource = nonVerbose(matchingResource);
      options.onResourceUpdated(kubeResource, isExperimental);
      refreshEvents();
    } else {
      options.onResourceNotFound();
    }
  };

  const isExperimental = await isKubernetesExperimentalMode();
  if (isExperimental) {
    resourcesListener = await listenResources(options.resourceName, {}, onUpdatedResources);
    if (options.listenEvents) {
      eventsListener = await listenResources('events', {}, (updatedEvents: KubernetesObject[]) => {
        allEvents = updatedEvents;
        refreshEvents();
      });
    }
  } else {
    if (options.legacyResourceStore) {
      resourcesUnsubscriber = options.legacyResourceStore.subscribe(onUpdatedResources);
    }
    if (options.listenEvents && options.legacyEventsStore) {
      eventsUnsubscriber = options.legacyEventsStore.subscribe(updatedEvents => {
        allEvents = updatedEvents.map(e => ({ kind: 'Event', ...e }));
        refreshEvents();
      });
    }
  }

  return {
    dispose: (): void => {
      resourcesListener?.dispose();
      eventsListener?.dispose();
      resourcesUnsubscriber?.();
      eventsUnsubscriber?.();
    },
  };
}

// removes "verbose" fields from a Kubernetes resource description:
// - metadata.managedFields
function nonVerbose(resource: KubernetesObject): KubernetesObject {
  if (resource.metadata?.managedFields) {
    const result = structuredClone(resource);
    delete result.metadata?.managedFields;
    return result;
  }
  return resource;
}

function isCoreV1Event(resource: KubernetesObject): resource is CoreV1Event {
  return resource.kind === 'Event';
}
