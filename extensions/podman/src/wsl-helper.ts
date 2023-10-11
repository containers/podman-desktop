import * as extensionApi from '@podman-desktop/api';
import { normalizeWSLOutput } from './util';

export interface WSLVersionInfo {
  wslVersion: string;
  kernelVersion: string;
  windowsVersion: string;
}

export class WslHelper {
  async getWSLVersionData(): Promise<WSLVersionInfo> {
    const { stdout } = await extensionApi.process.exec('wsl', ['--version']);
    /*
      got something like
      WSL version: 1.2.5.0
      Kernel version: 5.15.90.1
      WSLg version: 1.0.51
      MSRDC version: 1.2.3770
      Direct3D version: 1.608.2-61064218
      DXCore version: 10.0.25131.1002-220531-1700.rs-onecore-base2-hyp
      Windows version: 10.0.22621.2134

      N.B: the label before the colon symbol changes based on the system language. In an italian system you would have

      Versione WSL: 1.2.5.0
      Versione kernel: 5.15.90.1
      ...
    */

    // split the output in lines
    const lines = normalizeWSLOutput(stdout).split('\n');

    // the first line should display the version of the wsl - WSL version: 1.2.5.0
    const wslVersion = getVersionFromWSLOutput(lines[0], 'wsl');

    // the second line should display the kernel version - Kernel version: 5.15.90.1
    const kernelVersion = getVersionFromWSLOutput(lines[1], 'kernel');

    // the last line should display the Windows version - Windows version: 10.0.22621.2134
    const windowsVersion = getVersionFromWSLOutput(lines[6], 'windows');

    return { wslVersion, kernelVersion, windowsVersion };
  }
}

/**
 * it extract the content after the colon which should be the version of the tool/system
 * @param line the content to analyze
 * @param value the tool/system to find the version for
 * @returns the content after the colon if the line belongs to the tool/system we are searching info for
 */
function getVersionFromWSLOutput(line: string, value: string): string {
  if (!line) {
    return undefined;
  }
  const colonPosition = line.indexOf(':');
  if (colonPosition >= 0 && line.substring(0, colonPosition).toLowerCase().includes(value)) {
    return line.substring(colonPosition + 1).trim();
  }
  return undefined;
}
