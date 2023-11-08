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

  const imageChecker = extensionApi.imageChecker.registerImageCheckerProvider(
    {
      checkImage: (_image: string): Promise<extensionApi.ImageCheckResult> => {
        return new Promise((resolve, _reject) => {
          setTimeout(() => {
            return resolve({
              status: 'done',
              partialResults: [
                {
                  description: 'a warning',
                },
                {
                  description: 'another warning',
                },
              ],
            });
          }, 1000);
        });
      },
    },
    {
      label: 'Image Checker provider',
    },
  );
  extensionContext.subscriptions.push(imageChecker);
}

// Deactivate the extension
export function deactivate(): void {
  console.log('stopping image-checker extension');
}
