<script lang="ts">
import DeploymentActions from './DeploymentActions.svelte';
import type { DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;
</script>

<DeploymentActions deployment={object} on:update />
