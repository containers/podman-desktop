<script lang="ts">
import type { Guide } from '../../../../main/src/plugin/learning-center/learning-center-api';
import Button from '../ui/Button.svelte';
export let guide: Guide;
</script>

<div class="flex flex-1 flex-col bg-charcoal-600 pb-4 rounded-lg hover:bg-zinc-700">
  <dif class="pt-4">
    <div class="px-4">
      <img src="{`data:image/png;base64,${guide.icon}`}" alt="{guide.id}" style="{`height:48px;`}" />
    </div>
    <div class="px-4 pt-4">
      {guide.title}
    </div>
    <p class="text-base text-gray-700 px-4 pt-4">{guide.description}</p>
  </dif>
  <div class="flex justify-center items-end flex-1 pt-4">
    <Button
      class="justify-self-center self-end text-lg"
      on:click="{() => window.openExternal(guide.url)}"
      title="Get started">Get started</Button>
  </div>
</div>
