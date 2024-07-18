<script lang="ts">
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import ContainerActions from './ContainerActions.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

export let object: ContainerInfoUI;
</script>

{#if object.actionError}
  <ErrorMessage error={object.actionError} icon />
{/if}
<ContainerActions container={object} dropdownMenu={true} on:update />
