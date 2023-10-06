import * as extensionApi from '@podman-desktop/api';

export interface WSLVersionInfo {
  wslVersion: string;
  kernelVersion: string;
  windowsVersion: string;
}

export class WslHelper {
  async getWSLVersionData(): Promise<WSLVersionInfo> {
    const { stdout } = await extensionApi.process.exec('wsl', ['--version']);

    // got something like
    /*
WSL version: 1.2.5.0
Kernel version: 5.15.90.1
WSLg version: 1.0.51
MSRDC version: 1.2.3770
Direct3D version: 1.608.2-61064218
DXCore version: 10.0.25131.1002-220531-1700.rs-onecore-base2-hyp
Windows version: 10.0.22621.2134
 */

    // match the string WSL version: 1.2.5.0
    const wslVersion = stdout.match(/WSL version: ([0-9.]+)/)?.[1];

    // kernel version match the string Kernel version: 5.15.90.1
    const kernelVersion = stdout.match(/Kernel version: ([0-9.]+)/)?.[1];

    // Windows version match the string Windows version: 10.0.22621.2134
    const windowsVersion = stdout.match(/Windows version: ([0-9.]+)/)?.[1];

    return { wslVersion, kernelVersion, windowsVersion };
  }
}
