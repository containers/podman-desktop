<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';

export let runningOnly: boolean;
export let stoppedOnly: boolean;

$: title = getTitle(runningOnly, stoppedOnly);
$: message = getMessage(stoppedOnly);
$: commandLine = getCommandLine(stoppedOnly);

function getTitle(runningOnly: boolean, stoppedOnly: boolean): string {
  if (runningOnly) {
    return 'No running containers';
  } else if (stoppedOnly) {
    return 'No stopped containers';
  } else {
    return 'No containers';
  }
}
function getMessage(stoppedOnly: boolean): string {
  if (stoppedOnly) {
    return '';
  } else {
    return 'Run a first container using the following command line:';
  }
}
function getCommandLine(stoppedOnly: boolean): string {
  if (stoppedOnly) {
    return '';
  } else {
    return 'podman run quay.io/podman/hello';
  }
}
</script>

<EmptyScreen
  icon={ContainerIcon}
  title={title}
  message={message}
  commandline={commandLine}
  on:click={() => window.clipboardWriteText(commandLine)} />
