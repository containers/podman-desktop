<script lang="ts">
import ComposeActions from '../compose/ComposeActions.svelte';
import type { ContainerGroupInfoUI } from './ContainerInfoUI';

export let object: ContainerGroupInfoUI;
</script>

{#if object.status && object.engineId && object.engineType}
  <ComposeActions
    compose={{
      status: object.status,
      name: object.name,
      engineId: object.engineId,
      engineType: object.engineType,
      containers: object.containers,
    }}
    dropdownMenu={true}
    on:update />
{/if}
