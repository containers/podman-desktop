/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

export class QemuHelper {
  protected getArch(): NodeJS.Architecture {
    return process.arch;
  }

  async getQemuVersion(qemuPath?: string): Promise<string | undefined> {
    // qemu binary name depends on the arch
    // qemu-system-aarch64 for arm64
    // qemu-system-x86_64 for amd64

    let qemuBinaryName: string | undefined;
    // check depends on arch
    if (this.getArch() === 'arm64') {
      qemuBinaryName = 'qemu-system-aarch64';
    } else if (this.getArch() === 'x64') {
      qemuBinaryName = 'qemu-system-x86_64';
    }

    if (qemuBinaryName) {
      // grab output of the qemu CLI
      let env;
      if (qemuPath) {
        env = {
          env: {
            PATH: qemuPath,
          },
        };
      }
      const { stdout } = await extensionApi.process.exec(qemuBinaryName, ['--version'], env);
      // stdout is like QEMU emulator version 8.1.1

      // extract 8.1.1 from the string QEMU emulator version 8.1.1
      return stdout.match(/QEMU emulator version ([0-9.]+)/)?.[1];
    }
  }
}
