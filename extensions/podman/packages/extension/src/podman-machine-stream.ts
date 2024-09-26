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

import { Client } from "ssh2";
import { MachineInfo } from "./extension";
import * as fs from 'fs';
import { Stream } from "stream";
import { ProviderConnectionShellAccess } from "@podman-desktop/api";

export class PodmanMachineStream { 
    #host: string;
    #port: number;
    #username: string;
    #privateKey: string;
    #client: Client;

    constructor(
        private podmanMachine: MachineInfo
    ) {
        this.#host = "localhost",
        this.#port = podmanMachine.port,
        this.#username = podmanMachine.remoteUsername,
        this.#privateKey = podmanMachine.identityPath
        this.#client = new Client();
    };

    // createStream(shellAccess: ProviderConnectionShellAccess) {
    createStream(a: string) {
        // console.error("createStream, shellAccess: ", shellAccess)
        this.#client.on('ready', () => {

        console.log('Client :: ready');
        
        this.#client.shell((err, stream) => {
            // if (err) shellAccess.onError();

            stream.on('close', () => {
                console.log('Stream :: close');
                this.#client.end();
                // shellAccess.onEnd();
            }).on('data', (data:Stream) => {
                console.log('Out: ' + data);
                // shellAccess.onData(data);
                console.log(a);
            });
                stream.write("In: "+a+ "\n");
                // stream.write(shellAccess.write);
                stream.end();
        });
        }).connect({
        host: this.#host,
        port: this.#port,
        username: this.#username,
        privateKey: fs.readFileSync(this.#privateKey)
        });
    };
}