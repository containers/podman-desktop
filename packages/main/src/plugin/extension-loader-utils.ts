import type containerDesktopAPI from '@podman-desktop/api';

export const createAbortControllerOnCancellationToken = (
  token?: containerDesktopAPI.CancellationToken,
): AbortController | undefined => {
  if (token === undefined) {
    return undefined;
  }
  const abortController = new AbortController();
  token?.onCancellationRequested(() => {
    // if the token is cancelled, we trigger the abort on the AbortController
    abortController.abort();
  });
  return abortController;
};
