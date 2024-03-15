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

/* eslint-disable no-null/no-null */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Dockerode from 'dockerode';
import nock from 'nock';
import { beforeAll, expect, test } from 'vitest';

import { type LibPod, LibpodDockerode } from '/@/plugin/dockerode/libpod-dockerode.js';

import podmanInfo from '../../../tests/resources/data/plugin/podman-info.json';

beforeAll(() => {
  const libpod = new LibpodDockerode();
  libpod.enhancePrototypeWithLibPod();
});

test('Check force is not given with default remove pod options', async () => {
  nock('http://localhost')
    .delete('/v4.2.0/libpod/pods/dummy')
    .query(query => !query.force)
    .reply(200);
  const api = new Dockerode({ protocol: 'http', host: 'localhost' });
  await (api as unknown as LibPod).removePod('dummy');
});

test('Check force is given with remove pod options', async () => {
  nock('http://localhost')
    .delete('/v4.2.0/libpod/pods/dummy')
    .query(query => query.force === 'true')
    .reply(200);
  const api = new Dockerode({ protocol: 'http', host: 'localhost' });
  await (api as unknown as LibPod).removePod('dummy', { force: true });
});

test('Check list of containers using Podman API', async () => {
  const jsonContainers = [
    {
      AutoRemove: false,
      Command: ['httpd-foreground'],
      Created: '2023-08-09T13:49:31.12068064+02:00',
      CreatedAt: '',
      Exited: false,
      ExitedAt: 1691582587,
      ExitCode: 0,
      Id: '37a54a845ef27a212634ef00c994c0793b5f19ec16853d606beb1c929461c1cd',
      Image: 'docker.io/library/httpd:latest',
      ImageID: '911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a',
      IsInfra: false,
      Labels: null,
      Mounts: [],
      Names: ['gallant_solomon'],
      Namespaces: {},
      Networks: ['podman'],
      Pid: 1738,
      Pod: '',
      PodName: '',
      Ports: [
        {
          host_ip: '',
          container_port: 80,
          host_port: 9090,
          range: 1,
          protocol: 'tcp',
        },
      ],
      Size: null,
      StartedAt: 1691585124,
      State: 'running',
      Status: '',
    },
  ];

  nock('http://localhost').get('/v4.2.0/libpod/containers/json').reply(200, jsonContainers);
  const api = new Dockerode({ protocol: 'http', host: 'localhost' });
  const listOfContainers = await (api as unknown as LibPod).listPodmanContainers();
  expect(listOfContainers.length).toBe(1);
  const firstContainer = listOfContainers[0];
  expect(firstContainer.Id).toBe('37a54a845ef27a212634ef00c994c0793b5f19ec16853d606beb1c929461c1cd');
});

test('Check list of containers using Podman API and all true options', async () => {
  const jsonContainers = [
    {
      AutoRemove: false,
      Command: ['httpd-foreground'],
      Created: '2023-08-09T13:49:31.12068064+02:00',
      CreatedAt: '',
      Exited: false,
      ExitedAt: 1691582587,
      ExitCode: 0,
      Id: '37a54a845ef27a212634ef00c994c0793b5f19ec16853d606beb1c929461c1cd',
      Image: 'docker.io/library/httpd:latest',
      ImageID: '911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a',
      IsInfra: false,
      Labels: null,
      Mounts: [],
      Names: ['gallant_solomon'],
      Namespaces: {},
      Networks: ['podman'],
      Pid: 1738,
      Pod: '',
      PodName: '',
      Ports: [
        {
          host_ip: '',
          container_port: 80,
          host_port: 9090,
          range: 1,
          protocol: 'tcp',
        },
      ],
      Size: null,
      StartedAt: 1691585124,
      State: 'running',
      Status: '',
    },
  ];

  nock('http://localhost').get('/v4.2.0/libpod/containers/json?all=true').reply(200, jsonContainers);
  const api = new Dockerode({ protocol: 'http', host: 'localhost' });
  const listOfContainers = await (api as unknown as LibPod).listPodmanContainers({ all: true });
  expect(listOfContainers.length).toBe(1);
  const firstContainer = listOfContainers[0];
  expect(firstContainer.Id).toBe('37a54a845ef27a212634ef00c994c0793b5f19ec16853d606beb1c929461c1cd');
});

test('Check attach API', async () => {
  const containerPrompt = `#`;
  const containerId = '12345678';
  nock('http://localhost')
    .post(`/v4.2.0/libpod/containers/${containerId}/attach?stdin=true&stdout=true&stderr=true`)
    .reply(200, containerPrompt);

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });
  const libPod = api as any;

  // patch libpod to not wait for the test as websocket is not supported by nock
  const originalBuildRequest = libPod.modem.buildRequest;
  libPod.modem.buildRequest = function (options: unknown, context: any, data: unknown, callback: unknown): void {
    context.openStdin = false;
    return originalBuildRequest.call(this, options, context, data, callback);
  };

  const stream = await (api as unknown as LibPod).podmanAttach(containerId);
  expect(stream.on).toBeDefined();
});

test('Check info', async () => {
  nock('http://localhost').get('/v4.2.0/libpod/info').reply(200, podmanInfo);
  const api = new Dockerode({ protocol: 'http', host: 'localhost' });
  const info = await (api as unknown as LibPod).podmanInfo();
  expect(info).toBeDefined();
  expect(info).toStrictEqual(podmanInfo);
});

test('Check labels are passed to the api when creating a pod', async () => {
  nock('http://localhost')
    .post('/v4.2.0/libpod/pods/create', { name: 'pod1', labels: { key1: 'value1' } })
    .reply(201);
  const api = new Dockerode({ protocol: 'http', host: 'localhost' });
  await (api as unknown as LibPod).createPod({
    name: 'pod1',
    labels: {
      key1: 'value1',
    },
  });
});
