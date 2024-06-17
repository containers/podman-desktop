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

import { fireEvent } from '@testing-library/dom';
import { render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { expect, test, vi } from 'vitest';

import ContainerColumnName from './ContainerColumnName.svelte';
import { ContainerGroupInfoTypeUI, type ContainerGroupInfoUI, type ContainerInfoUI } from './ContainerInfoUI';

const container: ContainerInfoUI = {
  id: 'sha256:1234567890123',
  image: 'sha256:123',
  engineId: 'podman',
  engineName: 'podman',
  shortId: '',
  name: 'my-container',
  shortImage: '',
  engineType: 'podman',
  state: '',
  uptime: '',
  startedAt: '',
  ports: [],
  portsAsString: '',
  displayPort: '',
  hasPublicPort: false,
  groupInfo: {
    name: '',
    type: ContainerGroupInfoTypeUI.STANDALONE,
  },
  selected: false,
  created: 0,
  labels: {},
  imageBase64RepoTag: '',
};

const pod: ContainerGroupInfoUI = {
  type: ContainerGroupInfoTypeUI.POD,
  expanded: false,
  selected: false,
  allContainersCount: 0,
  containers: [],
  name: 'my-pod',
  engineType: ContainerGroupInfoTypeUI.PODMAN,
  engineId: 'engineId',
};

const compose: ContainerGroupInfoUI = {
  type: ContainerGroupInfoTypeUI.COMPOSE,
  expanded: false,
  selected: false,
  allContainersCount: 0,
  containers: [],
  name: 'my-compose',
  engineType: ContainerGroupInfoTypeUI.PODMAN,
  engineId: 'engine2',
};

test('Expect simple column styling - container', async () => {
  render(ContainerColumnName, { object: container });

  const text = screen.getByText(container.name);
  expect(text).toBeInTheDocument();
});

test('Expect simple column styling - pod', async () => {
  render(ContainerColumnName, { object: pod });

  const text = screen.getByText(`${pod.name} (pod)`);
  expect(text).toBeInTheDocument();
});

test('Expect simple column styling - compose', async () => {
  render(ContainerColumnName, { object: compose });

  const text = screen.getByText(`${compose.name} (compose)`);
  expect(text).toBeInTheDocument();
});

test('Expect clicking works - container', async () => {
  render(ContainerColumnName, { object: container });

  const text = screen.getByText(container.name);
  expect(text).toBeInTheDocument();

  // test click
  const routerGotoSpy = vi.spyOn(router, 'goto');
  fireEvent.click(text);

  expect(routerGotoSpy).toBeCalledWith(`/containers/${container.id}/`);
});

test('Expect clicking works - pod', async () => {
  render(ContainerColumnName, { object: pod });

  const text = screen.getByText(`${pod.name} (pod)`);
  expect(text).toBeInTheDocument();

  // test click
  const routerGotoSpy = vi.spyOn(router, 'goto');
  fireEvent.click(text);

  expect(routerGotoSpy).toBeCalledWith(`/pods/podman/${pod.name}/${pod.engineId}/logs`);
});

test('Expect clicking works - compose', async () => {
  render(ContainerColumnName, { object: compose });

  const text = screen.getByText(`${compose.name} (compose)`);
  expect(text).toBeInTheDocument();

  // test click
  const routerGotoSpy = vi.spyOn(router, 'goto');
  fireEvent.click(text);

  expect(routerGotoSpy).toBeCalledWith(`/compose/details/${compose.name}/${compose.engineId}/logs`);
});
