<script lang="ts">
import type { Guide } from '../../../../main/src/plugin/learning-center/learning-center-api';
import Button from '../ui/Button.svelte';

export let guide: Guide;
export let width = 300;
export let height = 300;

async function openGuide(guide: Guide): Promise<void> {
  window.telemetryTrack('openLearningCenterGuide', {
    guideId: guide.id,
  });
  await window.openExternal(guide.url);
}
</script>

<div
  class="flex flex-col flex-1 bg-charcoal-600 pb-4 rounded-lg hover:bg-zinc-700 min-w-[{width}px] min-h-[{height}px]">
  <div class="pt-4 flex flex-col">
    <div class="px-4">
      <img src="{`data:image/png;base64,${guide.icon}`}" class="h-[48px]" alt="{guide.id}" />
    </div>
    <div class="px-4 pt-4 text-nowrap text-sm text-gray-400">
      {guide.title}
    </div>
    <p class="line-clamp-4 px-4 pt-4 text-sm text-gray-700">{guide.description}</p>
  </div>
  <div class="flex justify-center items-end flex-1 pt-4">
    <Button class="justify-self-center self-end" on:click="{() => openGuide(guide)}" title="Get started"
      >Get started</Button>
  </div>
</div>
