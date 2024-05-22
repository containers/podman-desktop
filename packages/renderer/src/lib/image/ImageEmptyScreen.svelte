<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import ImageIcon from '../images/ImageIcon.svelte';
</script>

<EmptyScreen
  icon="{ImageIcon}"
  title="No images"
  message="Pull a first image using the following command line:"
  commandline="podman pull quay.io/podman/hello" />
