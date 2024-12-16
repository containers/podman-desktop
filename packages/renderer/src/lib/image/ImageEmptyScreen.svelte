<script lang="ts">
import { Button, EmptyScreen } from '@podman-desktop/ui-svelte';

import { providerInfos } from '/@/stores/providers';

import ImageIcon from '../images/ImageIcon.svelte';

$: selectedProviderConnection = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .find(providerContainerConnection => providerContainerConnection.status === 'started');

const firstImageName = 'quay.io/podman/hello';
const commandLine = `podman pull ${firstImageName}`;
let pullInProgress = false;

async function pullFirstImage() {
  if (!selectedProviderConnection) {
    await window.showMessageBox({
      title: `Error while pulling image`,
      message: `No provider connections found`,
    });
    return;
  }

  pullInProgress = true;
  try {
    await window.pullImage(selectedProviderConnection, firstImageName, () => {});
  } catch (error: unknown) {
    const errorMessage = error && typeof error === 'object' && 'message' in error ? error.message : error;
    await window.showMessageBox({
      title: `Error while pulling image`,
      message: `Error while pulling image from ${selectedProviderConnection.name}: ${errorMessage}`,
    });
  }
  pullInProgress = false;
}
</script>

<EmptyScreen
  icon={ImageIcon}
  title="No images"
  message="Pull a first image using the following command line:"
  commandline={commandLine}
  on:click={() => window.clipboardWriteText(commandLine)}>
  <div slot="upperContent">
    <span class="text-[var(--pd-details-empty-sub-header)] max-w-[800px] text-pretty mx-2"
      >Pull a first image by clicking on this button:</span>
    <div class="flex gap-2 justify-center p-3">
      <Button
        title="Pull {firstImageName} image"
        type="primary"
        inProgress={pullInProgress}
        on:click={() => pullFirstImage()}>Pull your first image</Button>
    </div>
    <h1 class="text-xl text-[var(--pd-details-empty-header)]">OR</h1>
  </div>
</EmptyScreen>
