<script lang="ts">
import StateChange from '../ui/StateChange.svelte';
import { ContainerUtils } from './container-utils';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;

const containerUtils = new ContainerUtils();
</script>

{#if containerUtils.isContainerInfoUI(object)}
  <div class="text-sm text-[var(--pd-table-body-text)]">
    <StateChange state="{object.state}">{object.uptime}</StateChange>
  </div>
{/if}
