<script lang="ts">
import { faDownload } from '@fortawesome/free-solid-svg-icons';

import type { FeaturedExtension } from '../../../../main/src/plugin/featured/featured-api';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import LoadingIcon from '../ui/LoadingIcon.svelte';

export let featuredExtension: FeaturedExtension;

let installInProgress = false;

let logs: string[] = [];
let errorInstall = '';

let percentage = '0%';

async function installExtension() {
  errorInstall = '';
  console.log('User asked to install the extension with the following properties', featuredExtension);
  logs = [];

  installInProgress = true;

  // do a trim on the image name
  const ociImage = featuredExtension?.fetchLink?.trim();

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
        console.log(`got an error when installing ${featuredExtension.id}`, error);
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
  aria-label="Install {featuredExtension.id} Extension"
  on:click="{() => installExtension()}"
  hidden="{!featuredExtension.fetchable}"
  title="Install {featuredExtension.displayName} v{featuredExtension.fetchVersion} Extension"
  class="border-2 relative rounded border-dustypurple-700 text-dustypurple-700 hover:bg-charcoal-800 hover:text-dustypurple-600 w-10 p-2 text-center cursor-pointer flex flex-row">
  <!--<Fa  class="ml-1.5" size="16" icon={faDownload} />-->
  <span class="ml-0.5"></span>
  <LoadingIcon
    icon="{faDownload}"
    iconSize="1x"
    loadingWidthClass="w-7"
    loadingHeightClass="h-7"
    positionTopClass="top-[2px]"
    positionLeftClass="left-[4px]"
    loading="{installInProgress}" />
  <span
    class:hidden="{!installInProgress}"
    class="absolute -top-[15px] right-0 text-dustypurple-500"
    style="font-size: 8px">{percentage}</span>
  <div class:hidden="{!errorInstall}" class="absolute w-56 -top-[25px] right-0" style="font-size: 8px">
    <ErrorMessage error="{errorInstall}" />
  </div>
</button>
