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

import * as extensionApi from '@tmpwip/extension-api';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {

    const socketPath = path.resolve(os.homedir(), '.lima/podman/sock/podman.sock');

    const dockerContainerProvider: extensionApi.ContainerProvider = {
        provideName: () => 'Lima',

        provideConnection: async (): Promise<string> => {
            return socketPath;
        },
    };
    if (fs.existsSync(socketPath)) {
        const disposable = await extensionApi.container.registerContainerProvider(dockerContainerProvider);
        extensionContext.subscriptions.push(disposable);
        console.log('Lima extension is active');
    } else {
        console.error(`Could not find podman socket at ${socketPath}`);
    }
}

export function deactivate(): void {
    console.log('stopping lima extension');
}

