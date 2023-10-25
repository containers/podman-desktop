<script lang="ts">
import EmptyScreen from '../ui/EmptyScreen.svelte';
import ContainerIcon from '../images/ContainerIcon.svelte';

export let selected: string;

$: title = getTitle(selected);
$: message = getMessage(selected);
$: commandLine = getCommandLine(selected);

function getTitle(selected: string): string {
  switch (selected) {
    case 'running':
      return 'No running containers';
    case 'stopped':
      return 'No stopped containers';
    default:
      return 'No containers';
  }
}

function getMessage(selected: string): string {
  switch (selected) {
    case 'stopped':
      return '';
    default:
      return 'Run a first container using the following command line:';
  }
}

function getCommandLine(selected: string): string {
  switch (selected) {
    case 'stopped':
      return '';
    default:
      return 'podman run quay.io/podman/hello';
  }
}
</script>

<EmptyScreen icon="{ContainerIcon}" title="{title}" message="{message}" commandline="{commandLine}" />
