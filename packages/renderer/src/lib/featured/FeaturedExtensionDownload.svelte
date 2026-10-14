<script lang="ts">
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import LoadingIcon from '/@/lib/ui/LoadingIcon.svelte';

interface Extension {
  id: string;
  fetchLink?: string;
  fetchVersion?: string;
  displayName: string;
  fetchable: boolean;
}

interface Props {
  extension: Extension;
  oninstall?: (extensionId: string) => void;
}

let { extension, oninstall = (): void => {} }: Props = $props();

let installInProgress = $state(false);

let logs: string[] = [];
let errorInstall = $state('');

let percentage = $state('0%');

async function installExtension(): Promise<void> {
  oninstall(extension.id);
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
    const percentageMatchRegexp = RegExp(/(\d+)%/);
    // download image
    await window.extensionInstallFromImage(
      ociImage,
      (data: string) => {
        logs = [...logs, data];
        console.log('data', data);

        // try to extract percentage from string like
        // data Downloading sha256:e8d2c9e5c69499c41ba39b7828c00e55087572884cac466b4d1b47243b085c7d.tar - 11% - (55132/521578)
        const percentageMatch = percentageMatchRegexp.exec(data);

        if (percentageMatch) {
          percentage = percentageMatch[1] + '%';
        }
      },
      (error: string) => {
        console.log(`got an error when installing ${extension.id}`, error);
        installInProgress = false;
        errorInstall = error;
      },
      extension.id,
    );
    logs = [...logs, '☑️ installation finished!'];
    percentage = '100%';
  } catch (error) {
    console.log('error', error);
  }
  installInProgress = false;
}
</script>

<ErrorMessage icon wrapMessage class="-top-[15px] right-0 absolute" error={errorInstall}/>
<button
  aria-label="Install {extension.id} Extension"
  onclick={installExtension}
  hidden={!extension.fetchable}
  title="Install {extension.displayName} v{extension.fetchVersion} Extension"
  class="border-2 relative rounded-sm border-[var(--pd-button-secondary-border)] text-[var(--pd-button-secondary-text)] hover:bg-[var(--pd-button-secondary-hover-bg)] w-10 p-2 text-center cursor-pointer flex flex-row justify-center">
  <LoadingIcon
    icon={faDownload}
    iconSize="1x"
    loading={installInProgress} />
  <span
    class:hidden={!installInProgress}
    class="absolute -top-[15px] right-0 text-[var(--pd-button-spinner)]"
    style="font-size: 8px">{percentage}</span>
</button>
