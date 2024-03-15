/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import { beforeEach, expect, test, vi } from 'vitest';

import { Certificates } from './certificates.js';

let certificate: Certificates;

const BEGIN_CERTIFICATE = '-----BEGIN CERTIFICATE-----';
const END_CERTIFICATE = '-----END CERTIFICATE-----';
const CR = '\n';

// mock spawn
vi.mock('node:child_process', () => {
  return {
    spawn: vi.fn(),
  };
});

beforeEach(() => {
  certificate = new Certificates();
  vi.clearAllMocks();
});

test('expect parse correctly certificates', async () => {
  const certificateContent = `${BEGIN_CERTIFICATE}${CR}Foo${CR}${END_CERTIFICATE}${CR}${BEGIN_CERTIFICATE}${CR}Bar${CR}${END_CERTIFICATE}${CR}${BEGIN_CERTIFICATE}${CR}Baz${CR}${END_CERTIFICATE}${CR}${BEGIN_CERTIFICATE}${CR}Qux${CR}${END_CERTIFICATE}${CR}`;
  const list = certificate.extractCertificates(certificateContent);
  expect(list.length).toBe(4);

  // strip prefix and suffix, CR
  const stripped = list.map(cert =>
    cert
      .replace(new RegExp(BEGIN_CERTIFICATE, 'g'), '')
      .replace(new RegExp(END_CERTIFICATE, 'g'), '')
      .replace(new RegExp(CR, 'g'), ''),
  );
  expect(stripped).toStrictEqual(['Foo', 'Bar', 'Baz', 'Qux']);
});
