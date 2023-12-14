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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, expect, test, vi } from 'vitest';
import { customWritable, type KubernetesInformerWritable } from './kubernetesInformerWritable';

const stopInformerMock = vi.fn();
Object.defineProperty(global, 'window', {
  value: {
    kubernetesStopInformer: stopInformerMock,
  },
});

beforeAll(() => {
  vi.clearAllMocks();
});

interface MyCustomTypeInfo {
  name: string;
}

test('expect startInformer to be called when subscribing', async () => {
  const startInformer = vi.fn().mockResolvedValue(1);
  const store: KubernetesInformerWritable<MyCustomTypeInfo[]> = customWritable([], startInformer);

  const unsubscribe = store.subscribe(() => {
    // nothing
  });

  //expect startInformer is called when subscribing
  expect(startInformer).toBeCalled();

  await new Promise(resolve => setTimeout(resolve, 1000));

  // the informer id should has been set by the startInformer
  const informerId = store.getInformerId();
  expect(informerId).equal(1);

  // when unsubscribing the stopInformer function is called
  unsubscribe();
  expect(stopInformerMock).toBeCalledWith(1);
});
