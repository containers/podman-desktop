<script lang="ts">
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;
</script>

{#if 'image' in object}
  <div class="text-sm text-gray-700 overflow-hidden text-ellipsis" title="{object.image}">
    {object.shortImage}
  </div>
{/if}
