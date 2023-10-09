import * as extensionApi from '@podman-desktop/api';

export interface PodmanBinaryLocationResult {
  source: string;
  error?: Error;
  foundPath?: string;
}
export class PodmanBinaryLocationHelper {
  async getPodmanLocationMac(): Promise<PodmanBinaryLocationResult> {
    let source: string;
    let foundPath: string;
    let error: Error;
    // execute which podman command to see from where it is coming
    try {
      const { stdout } = await extensionApi.process.exec('which', ['podman']);
      foundPath = stdout;
      if (stdout.startsWith('/opt/podman/bin/podman')) {
        source = 'installer';
      } else if (stdout.startsWith('/usr/local/bin/podman') || stdout.startsWith('/opt/homebrew/bin/podman')) {
        source = 'brew';
      } else {
        source = 'unknown';
      }
    } catch (err) {
      error = err;
      source = 'unknown';
      console.trace('unable to check from which path podman is coming', error);
    }
    return {
      source,
      error,
      foundPath,
    };
  }
}
