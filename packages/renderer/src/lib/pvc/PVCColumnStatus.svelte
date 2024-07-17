<script lang="ts">
import { StatusIcon } from '@podman-desktop/ui-svelte';

import PVCIcon from '../images/PVCIcon.svelte';
import type { PVCUI } from './PVCUI';

export let object: PVCUI;
</script>

<StatusIcon icon={PVCIcon} status={object.status} />
