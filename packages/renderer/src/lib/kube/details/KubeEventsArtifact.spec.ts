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

import '@testing-library/jest-dom/vitest';

import type { CoreV1Event } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import * as eventsTable from '/@/lib/kube/details/EventsTable.svelte';

import KubeEventsArtifact from './KubeEventsArtifact.svelte';

test('expect EventsTable is called with events if there are events', async () => {
  const eventsTableSpy = vi.spyOn(eventsTable, 'default');

  const events: CoreV1Event[] = [
    {
      metadata: {
        name: 'event1',
      },
      involvedObject: { uid: '12345678' },
    },
    {
      metadata: {
        name: 'event2',
      },
      involvedObject: { uid: '12345678' },
    },
  ];
  render(KubeEventsArtifact, { props: { events: events } });
  expect(eventsTableSpy).toHaveBeenCalledWith(expect.anything(), { events: events });
});

test('expect EventsTable is not called if there are no events, and No events is displayed', async () => {
  const eventsTableSpy = vi.spyOn(eventsTable, 'default');
  render(KubeEventsArtifact, { props: { events: [] } });
  expect(eventsTableSpy).not.toHaveBeenCalled();
  expect(screen.getByText('No events')).toBeInTheDocument();
});
