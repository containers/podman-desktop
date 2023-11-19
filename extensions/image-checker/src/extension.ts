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
import * as extensionApi from '@podman-desktop/api';
import EventEmitter = require('events');
import * as first from 'ee-first';

function registerProvider(
  data: extensionApi.ImageCheck[],
  timeout: number,
  name: string | undefined,
): extensionApi.Disposable {
  return extensionApi.imageChecker.registerImageCheckerProvider(
    {
      check: (
        _image: extensionApi.ImageInfo,
        token?: extensionApi.CancellationToken,
      ): extensionApi.ProviderResult<extensionApi.ImageChecks> => {
        const cancelEmitter = new EventEmitter();
        const doneEmitter = new EventEmitter();

        token?.onCancellationRequested(() => {
          console.log('check cancellation requested for async');
          cancelEmitter.emit('cancel');
        });

        const result = {
          checks: data,
        } as extensionApi.ImageChecks;

        setTimeout(() => {
          doneEmitter.emit('done');
        }, timeout);

        return new Promise((resolve, _reject) => {
          return first(
            [
              [cancelEmitter, 'cancel'],
              [doneEmitter, 'done'],
            ],
            function (_err, _ee, event, _args) {
              if (event === 'done') {
                return resolve(result);
              } else {
                return resolve({ checks: [] });
              }
            },
          );
        });
      },
    },
    {
      label: name,
    },
  );
}

// Activate the extension asynchronously
export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  // Create a provider with an example name, ID and icon
  const provider = extensionApi.provider.createProvider({
    name: 'Image Checker Extension',
    id: 'image-checker',
    status: 'unknown',
    images: {
      icon: './icon.png',
      logo: './icon.png',
    },
  });
  extensionContext.subscriptions.push(provider);

  // Provider with default name
  extensionContext.subscriptions.push(
    registerProvider(
      [
        {
          name: 'check 1',
          status: 'failed',
          severity: 'medium',
          markdownDescription: 'a warning',
        },
        {
          name: 'check 2',
          status: 'failed',
          severity: 'high',
          markdownDescription: 'an error',
        },
      ],
      2000,
      undefined,
    ),
  );

  // Provider with specific name
  extensionContext.subscriptions.push(
    registerProvider(
      [
        {
          name: 'USER directive',
          status: 'failed',
          severity: 'critical',
          markdownDescription: `USER directive set to root at line -1 could cause an unexpected behavior. In OpenShift, containers are run using arbitrarily assigned user ID`,
        },
        {
          name: 'USER directive',
          status: 'failed',
          severity: 'high',
          markdownDescription: `USER directive set to root at line -1 could cause an unexpected behavior. In OpenShift, containers are run using arbitrarily assigned user ID`,
        },
        {
          name: 'Base image',
          status: 'failed',
          severity: 'medium',
          markdownDescription: `unable to analyze the base image registry-proxy.engineering.redhat.com/rh-osbs/ubi9@sha256:6b95efc134c2af3d45472c0a2f88e6085433df058cc210abb2bb061ac4d74359`,
        },
        {
          name: 'result check 2',
          status: 'failed',
          severity: 'low',
          markdownDescription: `an error

bla bla`,
        },
        {
          name: 'check 3',
          status: 'success',
        },
      ],
      5000,
      'Image Checker provider **',
    ),
  );

  extensionContext.subscriptions.push(
    extensionApi.imageChecker.registerImageCheckerProvider(
      {
        check: (
          _image: extensionApi.ImageInfo,
          _token?: extensionApi.CancellationToken,
        ): extensionApi.ProviderResult<extensionApi.ImageChecks> => {
          return new Promise((_resolve, reject) => {
            reject(new Error('an internal error occured'));
          });
        },
      },
      {
        label: 'A Failing Provider',
      },
    ),
  );
}

// Deactivate the extension
export function deactivate(): void {
  console.log('stopping image-checker extension');
}
