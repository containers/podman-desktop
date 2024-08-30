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

import * as extensionApi from '@podman-desktop/api';

export class KrunkitHelper {
  async getKrunkitVersion(krunkitPath?: string): Promise<string | undefined> {
    const binaryName = 'krunkit';
    // grab output of the krunkit CLI
    let env;
    if (krunkitPath) {
      env = {
        env: {
          PATH: krunkitPath,
        },
      };
    }
    const { stdout } = await extensionApi.process.exec(binaryName, ['--version'], env);
    // stdout is like krunkit 0.1.2

    // extract 0.1.2 from the string krunkit 0.1.2
    return RegExp(/krunkit ([0-9.]+)/).exec(stdout)?.[1];
  }
}
