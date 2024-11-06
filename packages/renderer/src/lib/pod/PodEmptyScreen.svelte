<script lang="ts">
import { Button, EmptyScreen } from '@podman-desktop/ui-svelte';

import { providerInfos } from '/@/stores/providers';

import PodIcon from '../images/PodIcon.svelte';

const myFirstPod = 'myFirstPod';
const helloImage = 'quay.io/podman/hello:latest';
const commandLine = `podman run -dt --pod new:${myFirstPod} ${helloImage}`;

let inProgress = false;

$: selectedProviderConnection = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .find(providerContainerConnection => providerContainerConnection.status === 'started');

async function startPod(): Promise<void> {
  inProgress = true;
  if (selectedProviderConnection) {
    try {
      await window.pullImage(selectedProviderConnection, helloImage, () => {});
      const listImages = await window.listImages();
      const image = listImages.find(item => item.RepoTags?.includes(helloImage));
      await window.createPod({ name: myFirstPod });
      if (image) {
        await window.createAndStartContainer(image.engineId, { Image: helloImage, pod: myFirstPod });
      } else {
        await window.showMessageBox({
          title: `Error when running a pod`,
          message: `Could not find '${helloImage}'' in images`,
        });
      }
    } catch (error) {
      await window.showMessageBox({
        title: `Error when running a pod`,
        message: String(error),
      });
    } finally {
      inProgress = false;
    }
  } else {
    await window.showMessageBox({
      title: `Error when running a pod`,
      message: `No provider connections found`,
    });
  }
}
</script>

<EmptyScreen
  icon={PodIcon}
  title="No pods"
  message="Run a first pod using the following command line:"
  commandline={commandLine}
  on:click={() => window.clipboardWriteText(commandLine)}>
  <div slot="upperContent">
    <div class="flex gap-2 justify-center p-3">
      <Button title="Start your first pod" type="primary" inProgress={inProgress} on:click={() => startPod()}
        >Start your first pod</Button>
    </div>
    <h1 class="text-xl text-[var(--pd-details-empty-header)]">OR</h1>
  </div>
</EmptyScreen>
