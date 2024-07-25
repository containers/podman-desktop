<script lang="ts">
import { StatusIcon } from '@podman-desktop/ui-svelte';

import ServiceIcon from '../images/ServiceIcon.svelte';
import type { ServiceUI } from './ServiceUI';

export let object: ServiceUI;
</script>

<StatusIcon icon={ServiceIcon} status={object.status} />
