<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import VolumeIcon from '../images/VolumeIcon.svelte';

const commandLine = 'podman volume create myFirstVolume';
</script>

<EmptyScreen
  icon={VolumeIcon}
  title="No volumes"
  message="Create a volume using the following command line:"
  commandline={commandLine}
  on:click={() => window.clipboardWriteText(commandLine)} />
