<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import ImageIcon from '../images/ImageIcon.svelte';

const commandLine = 'podman pull quay.io/podman/hello';
</script>

<EmptyScreen
  icon={ImageIcon}
  title="No images"
  message="Pull a first image using the following command line:"
  commandline={commandLine}
  on:click={() => window.clipboardWriteText(commandLine)} />
