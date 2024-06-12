<script lang="ts">
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;
</script>

{#if 'image' in object}
  <div class="text-sm text-[var(--pd-table-body-text)] overflow-hidden text-ellipsis" title="{object.image}">
    {object.shortImage}
  </div>
{/if}
