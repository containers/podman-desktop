<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import PodIcon from '../images/PodIcon.svelte';

const commandLine = 'podman pod create --label myFirstPod';
</script>

<EmptyScreen
  icon={PodIcon}
  title="No pods"
  message="Run a first pod using the following command line:"
  commandline={commandLine}
  on:click={() => window.clipboardWriteText(commandLine)} />
