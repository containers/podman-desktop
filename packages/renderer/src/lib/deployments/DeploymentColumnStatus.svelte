<script lang="ts">
import { StatusIcon } from '@podman-desktop/ui-svelte';

import DeploymentIcon from '../images/DeploymentIcon.svelte';
import type { DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;
</script>

<StatusIcon icon={DeploymentIcon} status={object.status} />
