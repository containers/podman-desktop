<script lang="ts">
import StateChange from '../ui/StateChange.svelte';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;
</script>

{#if 'state' in object}
  <div class="text-sm text-gray-700">
    <StateChange state="{object.state}">{object.uptime}</StateChange>
  </div>
{/if}
