<script lang="ts">
import { StatusIcon } from '@podman-desktop/ui-svelte';

import PodIcon from '../images/PodIcon.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let object: PodInfoUI;
</script>

<StatusIcon icon={PodIcon} status={object.status} />
