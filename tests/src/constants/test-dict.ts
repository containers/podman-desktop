export const PODMAN_STATUS2 = new Map<string, string>([
  ['not_installed', 'value1'],
  ['installed', 'value2'],
  ['initialized', 'value1'],
  ['started', 'value2'],
]);

export enum PODMAN_STATUS {
  NOT_INSTALLED = 'Not Installed',
  INSTALLED = 'Installed',
  INITIALIZED = 'Initialized',
  STARTED = 'Started',
}

export type PODMAN_INSTALLATION_STATUS = {

}
