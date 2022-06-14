import type { Registry } from '@tmpwip/extension-api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkServerValue(event: any): string {
  const userValue = event.target.value;
  if (userValue === '' || userValue === undefined) {
    return 'Please enter a value';
  } else {
    return '';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkUsernameValue(event: any): string {
  const userValue = event.target.value;
  if (userValue === '' || userValue === undefined) {
    return 'Please enter a value';
  } else {
    return '';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function checkPasswordValue(event: any): string {
  const userValue = event.target.value;
  if (userValue === '' || userValue === undefined) {
    return 'Please enter a value';
  } else {
    return '';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function addRegistry(registryToCreate: Registry): Promise<string> {
  try {
    await window.createImageRegistry(registryToCreate.source, registryToCreate);
  } catch (error) {
    return '' + error;
  }
  return '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function removeRegistry(registry: Registry): void {
  window.unregisterImageRegistry(registry);
}
