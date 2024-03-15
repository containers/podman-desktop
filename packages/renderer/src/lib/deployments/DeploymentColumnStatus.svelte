<script lang="ts">
import DeploymentIcon from '../images/DeploymentIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import type { DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;
</script>

<StatusIcon icon="{DeploymentIcon}" status="{object.status}" />
