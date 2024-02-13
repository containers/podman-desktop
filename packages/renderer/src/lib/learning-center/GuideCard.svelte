<script lang="ts">
import type { Guide } from '../../../../main/src/plugin/learning-center/learning-center-api';
import Button from '../ui/Button.svelte';
export let guide: Guide;
export let width = 300;
export let height = 300;
</script>

<div
  class="flex flex-col flex-1 bg-charcoal-600 pb-4 rounded-lg hover:bg-zinc-700 min-w-[{width}px] min-h-[{height}px]">
  <dif class="pt-4 flex flex-col">
    <div class="px-4">
      <img src="{`data:image/png;base64,${guide.icon}`}" class="h-[48px]" alt="{guide.id}" />
    </div>
    <div class="px-4 pt-4 text-nowrap text-gray-400">
      {guide.title}
    </div>
    <p class="line-clamp-4 px-4 pt-4 text-base text-gray-700">{guide.description}</p>
  </dif>
  <div class="flex justify-center items-end flex-1 pt-4">
    <Button
      class="justify-self-center self-end text-md"
      on:click="{() => window.openExternal(guide.url)}"
      title="Get started">Get started</Button>
  </div>
</div>
