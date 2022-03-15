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
import * as net from 'net';
import {spawn} from 'child_process';

const podmanMachineSocketsDirectory = path.resolve(os.homedir(), '.local/share/containers/podman/machine');
const podmanMachineQemuDirectory = path.resolve(podmanMachineSocketsDirectory, 'qemu');
const watchers = new Map<string, fs.FSWatcher>();
const currentProviders: extensionApi.Disposable[] = [];
const lifecycleProviders = new Map<string, extensionApi.ContainerProviderLifecycle>();
let storedExtensionContext;
let refreshMachine = false;
let stopLoop = false;
/*
function unregisterProviders() {
    currentProviders.forEach(p => p.dispose());
}
*/
async function initMachines() {

    // we search for all sockets and try to connect if possible
    const children = await fs.promises.readdir(podmanMachineSocketsDirectory, { withFileTypes: true });
    // grab all directories except qemu one
    const directories = children.filter(c => c.isDirectory() && c.name !== 'qemu').map(c => c.name);

    // ok now for each directory, register a provider if socket is working
    await Promise.all(directories.map(async (directory) => {
        // podman.sock link
        const socketPath = path.resolve(podmanMachineSocketsDirectory, directory, 'podman.sock');
        const available = await socketAvailable(socketPath);
        let status = 'stopped';
        if (available) {
            registerProviderFor(directory, socketPath);
            status = 'started';
        }
        registerProviderLifecycle(directory, status);

        // monitor qemu file
        const children = await fs.promises.readdir(podmanMachineQemuDirectory, { withFileTypes: true });
        const qemuFile = children.filter(c => c.isFile() && c.name.startsWith(`${directory}_`)).map(c => c.name);
        if (qemuFile.length === 1) {
            monitorQemuMachine(path.resolve(podmanMachineQemuDirectory, qemuFile[0]));
        }
    }));
}


async function timeout(time: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, time);
    });
}

async function refreshMachinesCron() {

    // we need to refresh as during the last 5 seconds, we need a refresh
    if (refreshMachine) {
        await Promise.all(currentProviders.map(provider => provider.dispose()));
        currentProviders.length = 0;
        initMachines();
        // we disable the refresh for a while
        refreshMachine = false;
    }

    // call us again
    if (!stopLoop) {
        await timeout(5000);
        refreshMachinesCron();
    }
}

async function monitorQemuMachine(qemuFileToWatch) {
    if (watchers.get(qemuFileToWatch)) {
        // already watching, skip
        return;
    }
    const watcher = fs.watch(qemuFileToWatch, () => {
        // we refresh the list of machines every time there is a new event in that directory
        refreshMachine = true;
    });
    watchers.set(qemuFileToWatch, watcher);

}

async function registerProviderFor(directory: string, socketPath: string) {
    const provider: extensionApi.ContainerProvider = {
        provideName: () => `podman-machine-${directory}`,

        provideConnection: async (): Promise<string> => {
            return socketPath;
        },
    };

    console.log('Registering podman provider for', directory);
    const disposable = await extensionApi.container.registerContainerProvider(provider);
    currentProviders.push(disposable);
    storedExtensionContext.subscriptions.push(disposable);
}

function execPromise(command, args) {
    return new Promise((resolve) => {
        spawn(command, args);
        resolve(true);
    });
}


async function registerProviderLifecycle(directory: string, status: string) {
    const providerLifecycle: extensionApi.ContainerProviderLifecycle = {
        provideName: () => `podman-machine-${directory}`,
        status: () => status,

        start: async (): Promise<void> =>{
            // start the machine
            console.log(`executing podman machine start ${directory}`);
            await execPromise('podman', ['machine', 'start', directory]);
            // wait before machine is up
            await timeout(10000);
            console.log('machine is started !');
        },
        stop: async (): Promise<void> =>{
            console.log(`executing podman machine stop ${directory}`);
            await execPromise('podman', ['machine', 'stop', directory]);
            // wait before machine is stopped
            await timeout(5000);
            console.log('machine is stopped !');
        },
        handleLifecycleChange: async (callback: (event: string) => void): Promise<void> => {
            callback('started');
        },
    };
    console.log('Registering podman provider lifecyclefor', directory);
    const disposable = await extensionApi.container.registerContainerProviderLifecycle(providerLifecycle);
    // currentProviders.push(disposable);
    storedExtensionContext.subscriptions.push(disposable);
    lifecycleProviders.set(directory, providerLifecycle);

}

async function socketAvailable(socketPath): Promise<boolean> {

    const client = new net.Socket();
    const promise = new Promise<boolean>((res) => {
        client.connect(
            socketPath,
            () => {
                // stop connection
                client.destroy();
                res(true);
            },
        );
        client.on('error', () => res(false));
    });
    return promise;

}


export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
    storedExtensionContext = extensionContext;

    // no podman for now, skip
    if (!fs.existsSync(podmanMachineSocketsDirectory)) {
        return;
    }

    // track all podman machines available
    fs.watch(podmanMachineSocketsDirectory, () => {
        // we refresh the list of machines every time there is a new event in that directory
        refreshMachine = true;
    });

    // do the first initialization
    initMachines();
    refreshMachinesCron();
}

export function deactivate(): void {
    stopLoop = true;
    console.log('stopping podman extension');
}

