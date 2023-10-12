import * as extensionApi from '@podman-desktop/api';

export class QemuHelper {
  protected getArch(): NodeJS.Architecture {
    return process.arch;
  }

  async getQemuVersion(qemuPath?: string): Promise<string> {
    // qemu binary name depends on the arch
    // qemu-system-aarch64 for arm64
    // qemu-system-x86_64 for amd64

    let qemuBinaryName: string;
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
