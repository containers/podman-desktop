<script lang="ts">
import { onMount } from 'svelte';
import type { Guide } from '../../../../main/src/plugin/learning-center/learning-center-api';
import Carousel from '../carousel/Carousel.svelte';

let guides: Guide[] = [];

onMount(async () => {
  guides = await window.listGuides();
});
</script>

<p class="text-lg first-letter:uppercase font-bold">Learning center:</p>
<div>
  <Carousel cards="{guides}" let:card>
    <div class="hover:bg-zinc-70">
      <img src="{`data:image/png;base64,${card.icon}`}" alt="{card.id}" style="{`width:32px;`}" />
    </div>
    <div>
      {card.title}
    </div>
    <p class="text-base text-gray-700">{card.description}</p>
  </Carousel>
</div>
