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

import { beforeAll, test } from 'vitest';
import { type LibPod, LibpodDockerode } from '/@/plugin/dockerode/libpod-dockerode.js';
import Dockerode from 'dockerode';
import nock from 'nock';

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
