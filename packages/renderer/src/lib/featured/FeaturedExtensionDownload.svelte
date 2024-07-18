<script lang="ts">
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import LoadingIcon from '../ui/LoadingIcon.svelte';

export let extension: {
  id: string;
  fetchLink?: string;
  fetchVersion?: string;
  displayName: string;
  fetchable: boolean;
};

let installInProgress = false;

let logs: string[] = [];
let errorInstall = '';

let percentage = '0%';

async function installExtension() {
  errorInstall = '';
  console.log('User asked to install the extension with the following properties', extension);
  logs = [];

  installInProgress = true;

  // do a trim on the image name
  const ociImage = extension?.fetchLink?.trim();

  if (!ociImage) {
    console.log('No image to install');
    errorInstall = 'No image to install';
    installInProgress = false;
    return;
  }

  try {
    // download image
    await window.extensionInstallFromImage(
      ociImage,
      (data: string) => {
        logs = [...logs, data];
        console.log('data', data);

        // try to extract percentage from string like
        // data Downloading sha256:e8d2c9e5c69499c41ba39b7828c00e55087572884cac466b4d1b47243b085c7d.tar - 11% - (55132/521578)
        const percentageMatch = data.match(/(\d+)%/);
        if (percentageMatch) {
          percentage = percentageMatch[1] + '%';
        }
      },
      (error: string) => {
        console.log(`got an error when installing ${extension.id}`, error);
        installInProgress = false;
        errorInstall = error;
      },
    );
    logs = [...logs, '☑️ installation finished !'];
    percentage = '100%';
  } catch (error) {
    console.log('error', error);
  }
  installInProgress = false;
}
</script>

<button
  aria-label="Install {extension.id} Extension"
  on:click={() => installExtension()}
  hidden={!extension.fetchable}
  title="Install {extension.displayName} v{extension.fetchVersion} Extension"
  class="border-2 relative rounded border-[var(--pd-button-secondary)] text-[var(--pd-button-secondary)] hover:text-[var(--pd-button-text)] hover:bg-[var(--pd-button-secondary-hover)] hover:border-[var(--pd-button-secondary-hover)] w-10 p-2 text-center cursor-pointer flex flex-row justify-center">
  <LoadingIcon
    icon={faDownload}
    iconSize="1x"
    loadingWidthClass="w-7"
    loadingHeightClass="h-7"
    positionTopClass="top-[2px]"
    positionLeftClass="left-[4px]"
    loading={installInProgress} />
  <span
    class:hidden={!installInProgress}
    class="absolute -top-[15px] right-0 text-[var(--pd-action-button-spinner)]"
    style="font-size: 8px">{percentage}</span>
  <div class:hidden={!errorInstall} class="absolute w-56 -top-[25px] right-0" style="font-size: 8px">
    <ErrorMessage error={errorInstall} />
  </div>
</button>
