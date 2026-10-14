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
import { type Writable, writable } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { listenResource } from './resource-listen';
import * as resourcesListen from './resources-listen';

vi.mock(import('./resources-listen'));

type initListsReturnType = {
  updateResources: (objects: KubernetesObject[]) => void;
  updateEvents: (objects: CoreV1Event[]) => void;
  legacyResourceStore?: Writable<KubernetesObject[]>;
  legacyEventsStore?: Writable<CoreV1Event[]>;
};

describe.each<{
  experimental: boolean;
  initLists: (resources: KubernetesObject[], events: CoreV1Event[]) => initListsReturnType;
}>([
  {
    experimental: true,
    initLists: (resources: KubernetesObject[], events: CoreV1Event[]): initListsReturnType => {
      let resourcesCallback: (resources: KubernetesObject[]) => void;
      let eventsCallback: (events: CoreV1Event[]) => void;
      vi.mocked(resourcesListen.listenResources).mockImplementation(
        async (resourceName, _options, cb): Promise<IDisposable> => {
          if (resourceName === 'events') {
            eventsCallback = cb;
            setTimeout(() => eventsCallback(events));
            return {
              dispose: (): void => {},
            };
          } else {
            resourcesCallback = cb;
            setTimeout(() => resourcesCallback(resources));
            return {
              dispose: (): void => {},
            };
          }
        },
      );
      return {
        updateResources: (updatedObjects: KubernetesObject[]): void => {
          resourcesCallback(updatedObjects);
        },
        updateEvents: (updatedObjects: CoreV1Event[]): void => {
          eventsCallback(updatedObjects);
        },
      };
    },
  },
  {
    experimental: false,
    initLists: (services: KubernetesObject[], events: CoreV1Event[]): initListsReturnType => {
      const legacyResourceStore = writable<KubernetesObject[]>(services);
      const legacyEventsStore = writable<CoreV1Event[]>(events);
      return {
        legacyResourceStore,
        legacyEventsStore,
        updateResources: (resources: KubernetesObject[]): void => {
          legacyResourceStore.set(resources);
        },
        updateEvents: (events: CoreV1Event[]): void => {
          legacyEventsStore.set(events);
        },
      };
    },
  },
])('experimental is $experimental', ({ experimental, initLists }) => {
  describe.each<{ listenEvents: boolean }>([
    {
      listenEvents: true,
    },
    {
      listenEvents: false,
    },
  ])('listenEvents is $listenEvents', ({ listenEvents }) => {
    let listener: IDisposable | undefined;

    beforeEach(() => {
      vi.mocked(resourcesListen.isKubernetesExperimentalMode).mockResolvedValue(experimental);
    });

    afterEach(() => {
      listener?.dispose();
    });

    test('onResourceNotFound is called if the resource is not found', async () => {
      const lists = initLists([], []);

      const onResourceNotFoundSpy = vi.fn();
      const onResourceUpdatedSpy = vi.fn();
      const onEventsUpdatedSpy = vi.fn();
      listener = await listenResource({
        resourceName: 'myresources',
        name: 'res1',
        namespace: 'ns1',
        listenEvents,
        legacyResourceStore: lists.legacyResourceStore,
        legacyEventsStore: lists.legacyEventsStore,
        onResourceNotFound: onResourceNotFoundSpy,
        onResourceUpdated: onResourceUpdatedSpy,
        onEventsUpdated: onEventsUpdatedSpy,
      });

      await vi.waitFor(() => {
        expect(onResourceNotFoundSpy).toHaveBeenCalled();
        if (listenEvents) {
          expect(onEventsUpdatedSpy).toBeCalledWith([]);
        } else {
          expect(onEventsUpdatedSpy).not.toHaveBeenCalled();
        }
      });
      expect(onResourceUpdatedSpy).not.toBeCalled();
    });

    test('onResourceUpdated is called if the namespaced resource is found', async () => {
      const res1 = {
        kind: 'MyResource',
        metadata: {
          name: 'res1',
          namespace: 'ns1',
        },
      };
      const res2 = {
        kind: 'MyResource',
        metadata: {
          name: 'other-resource',
          namespace: 'ns1',
        },
      };
      const lists = initLists([res1, res2], []);

      const onResourceNotFoundSpy = vi.fn();
      const onResourceUpdatedSpy = vi.fn();
      const onEventsUpdatedSpy = vi.fn();
      listener = await listenResource({
        resourceName: 'myresources',
        name: 'res1',
        namespace: 'ns1',
        listenEvents,
        legacyResourceStore: lists.legacyResourceStore,
        legacyEventsStore: lists.legacyEventsStore,
        onResourceNotFound: onResourceNotFoundSpy,
        onResourceUpdated: onResourceUpdatedSpy,
        onEventsUpdated: onEventsUpdatedSpy,
      });

      await vi.waitFor(() => {
        expect(onResourceUpdatedSpy).toBeCalledWith(res1, experimental);
        if (listenEvents) {
          expect(onEventsUpdatedSpy).toBeCalledWith([]);
        } else {
          expect(onEventsUpdatedSpy).not.toHaveBeenCalled();
        }
      });
      expect(onResourceNotFoundSpy).not.toHaveBeenCalled();
    });

    test('onResourceUpdated is called if the non-namespaced resource is found', async () => {
      const res1 = {
        kind: 'MyResource',
        metadata: {
          name: 'res1',
        },
      };
      const res2 = {
        kind: 'MyResource',
        metadata: {
          name: 'other-resource',
        },
      };
      const lists = initLists([res1, res2], []);

      const onResourceNotFoundSpy = vi.fn();
      const onResourceUpdatedSpy = vi.fn();
      const onEventsUpdatedSpy = vi.fn();
      listener = await listenResource({
        resourceName: 'myresources',
        name: 'res1',
        listenEvents,
        legacyResourceStore: lists.legacyResourceStore,
        legacyEventsStore: lists.legacyEventsStore,
        onResourceNotFound: onResourceNotFoundSpy,
        onResourceUpdated: onResourceUpdatedSpy,
        onEventsUpdated: onEventsUpdatedSpy,
      });

      await vi.waitFor(() => {
        expect(onResourceUpdatedSpy).toBeCalledWith(res1, experimental);
        if (listenEvents) {
          expect(onEventsUpdatedSpy).toBeCalledWith([]);
        } else {
          expect(onEventsUpdatedSpy).not.toHaveBeenCalled();
        }
      });
      expect(onResourceNotFoundSpy).not.toHaveBeenCalled();
    });

    test('onResourceUpdated is called with non verbose resource', async () => {
      const res1: KubernetesObject = {
        kind: 'MyResource',
        metadata: {
          name: 'res1',
          namespace: 'ns1',
        },
      };
      const verboseRes1 = structuredClone(res1);
      verboseRes1.metadata = {
        ...verboseRes1.metadata,
        managedFields: [{}],
      };
      const res2 = {
        kind: 'MyResource',
        metadata: {
          name: 'other-resource',
          namespace: 'ns1',
        },
      };
      const lists = initLists([verboseRes1, res2], []);

      const onResourceNotFoundSpy = vi.fn();
      const onResourceUpdatedSpy = vi.fn();
      const onEventsUpdatedSpy = vi.fn();
      listener = await listenResource({
        resourceName: 'myresources',
        name: 'res1',
        namespace: 'ns1',
        listenEvents,
        legacyResourceStore: lists.legacyResourceStore,
        legacyEventsStore: lists.legacyEventsStore,
        onResourceNotFound: onResourceNotFoundSpy,
        onResourceUpdated: onResourceUpdatedSpy,
        onEventsUpdated: onEventsUpdatedSpy,
      });

      await vi.waitFor(() => {
        expect(onResourceUpdatedSpy).toBeCalledWith(res1, experimental);
      });
    });

    test('onEventsUpdated is called with matching events only', async () => {
      const res1 = {
        kind: 'MyResource',
        metadata: {
          name: 'res1',
          namespace: 'ns1',
          uid: 'uid-res1',
        },
      };
      const res2 = {
        kind: 'MyResource',
        metadata: {
          name: 'res2',
          namespace: 'ns1',
          uid: 'uid-res2',
        },
      };
      const event1Res1: CoreV1Event = {
        kind: 'Event',
        metadata: {
          name: 'event1Res1',
        },
        involvedObject: {
          uid: 'uid-res1',
        },
      };
      const event2Res1: CoreV1Event = {
        kind: 'Event',
        metadata: {
          name: 'event2Res1',
        },
        involvedObject: {
          uid: 'uid-res1',
        },
      };
      const event1Res2: CoreV1Event = {
        kind: 'Event',
        metadata: {
          name: 'event1Res2',
        },
        involvedObject: {
          uid: 'uid-res2',
        },
      };
      const lists = initLists([res1, res2], [event1Res1, event1Res2, event2Res1]);

      const onResourceNotFoundSpy = vi.fn();
      const onResourceUpdatedSpy = vi.fn();
      const onEventsUpdatedSpy = vi.fn();
      listener = await listenResource({
        resourceName: 'myresources',
        name: 'res1',
        namespace: 'ns1',
        listenEvents,
        legacyResourceStore: lists.legacyResourceStore,
        legacyEventsStore: lists.legacyEventsStore,
        onResourceNotFound: onResourceNotFoundSpy,
        onResourceUpdated: onResourceUpdatedSpy,
        onEventsUpdated: onEventsUpdatedSpy,
      });

      await vi.waitFor(() => {
        expect(onResourceUpdatedSpy).toBeCalledWith(res1, experimental);
        if (listenEvents) {
          expect(onEventsUpdatedSpy).toBeCalledWith([event1Res1, event2Res1]);
        } else {
          expect(onEventsUpdatedSpy).not.toHaveBeenCalled();
        }
      });
      expect(onResourceNotFoundSpy).not.toHaveBeenCalled();
    });
  });
});
