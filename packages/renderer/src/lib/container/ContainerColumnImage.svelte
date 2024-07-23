<script lang="ts">
import { ContainerUtils } from './container-utils';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;

const containerUtils = new ContainerUtils();
</script>

{#if containerUtils.isContainerInfoUI(object)}
  <div class="text-[var(--pd-table-body-text)] overflow-hidden text-ellipsis" title={object.image}>
    {object.shortImage}
  </div>
{/if}
