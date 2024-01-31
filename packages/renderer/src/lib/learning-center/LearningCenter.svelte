<script lang="ts">
import { onMount } from 'svelte';
import Carousel from '../carousel/Carousel.svelte';
import GuideCard from './GuideCard.svelte';
import type { Guide } from '../../../../main/src/plugin/learning-center/learning-center-api';

let guides: Guide[] = [];

onMount(async () => {
  guides = await window.listGuides();
});
</script>

<div class="flex flex-1 flex-col">
  <p class="text-lg first-letter:uppercase font-bold pb-5">Learning center:</p>
  <div class="flex flex-1 flex-col bg-charcoal-800 p-5 rounded-lg">
    <Carousel cards="{guides}" let:card>
      <GuideCard guide="{card}" />
    </Carousel>
  </div>
</div>
