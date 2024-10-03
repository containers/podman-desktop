<script lang="ts">
import { Button, EmptyScreen } from '@podman-desktop/ui-svelte';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';

import { providerInfos } from '../../stores/providers';

export let runningOnly: boolean;
export let stoppedOnly: boolean;
const helloImage: string = 'quay.io/podman/hello:latest';

$: inProgress = false;
$: title = getTitle(runningOnly, stoppedOnly);
$: messageCommandLine = getMessageCommandLine(stoppedOnly);
$: messageButton = getMessageButton(stoppedOnly);
$: commandLine = getCommandLine(stoppedOnly);
$: selectedProviderConnection = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .find(providerContainerConnection => providerContainerConnection.status === 'started');

function getTitle(runningOnly: boolean, stoppedOnly: boolean): string {
  // eslint-disable-next-line sonarjs/no-selector-parameter
  if (runningOnly) {
    return 'No running containers';
  } else if (stoppedOnly) {
    return 'No stopped containers';
  } else {
    return 'No containers';
  }
}
function getMessageCommandLine(stoppedOnly: boolean): string {
  // eslint-disable-next-line sonarjs/no-selector-parameter
  if (stoppedOnly) {
    return '';
  } else {
    return 'Run a first container using the following command line:';
  }
}
function getMessageButton(stoppedOnly: boolean): string {
  // eslint-disable-next-line sonarjs/no-selector-parameter
  if (stoppedOnly) {
    return '';
  } else {
    return 'Run a first container by clicking on this button:';
  }
}
function getCommandLine(stoppedOnly: boolean): string {
  // eslint-disable-next-line sonarjs/no-selector-parameter
  if (stoppedOnly) {
    return '';
  } else {
    return 'podman run quay.io/podman/hello';
  }
}
async function runContainer(commandLine: string) {
  try {
    inProgress = true;
    if (selectedProviderConnection) {
      await window.pullImage(selectedProviderConnection, helloImage, () => {});
      const listImages = await window.listImages();
      const image = listImages.find(item => item.RepoTags?.includes(helloImage));
      if (image) {
        await window.createAndStartContainer(image.engineId, { Image: helloImage });
      } else {
        await window.showMessageBox({
          title: `Error when running container`,
          message: `Could not find ${helloImage} in images`,
        });
      }
      window.telemetryTrack('startFirstContainerByButton');
    }
  } catch (err) {
    await window.showMessageBox({
      title: `Error when running container`,
      message: `Error while executing ${commandLine}: ${String(err)}`,
    });
  }
  inProgress = false;
}
</script>

<EmptyScreen
  icon={ContainerIcon}
  title={title}
  message={messageCommandLine}
  commandline={commandLine}
  on:click={() => window.clipboardWriteText(commandLine)}>
  <div slot="upperContent" hidden={stoppedOnly}>
    <span class="text-[var(--pd-details-empty-sub-header)] max-w-[800px] text-pretty mx-2">{messageButton}</span>
    <div class="flex gap-2 justify-center p-3">
      <Button
        title="Pull {helloImage} image and start container"
        type="primary"
        inProgress={inProgress}
        on:click={() => runContainer(commandLine)}>Start your first container</Button>
    </div>
    <h1 class="text-xl text-[var(--pd-details-empty-header)]">OR</h1>
  </div>
</EmptyScreen>
