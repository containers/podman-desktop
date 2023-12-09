<script lang="ts">
import { onMount } from 'svelte';
import Carousel from '../carousel/Carousel.svelte';
import GuideCard from './GuideCard.svelte';

let loadedGuides: any[] = [];
$: guides = [...loadedGuides];

onMount(async () => {
  loadedGuides = await window.listGuides();
});
</script>

<div class="m-5">
  <p class="text-lg first-letter:uppercase font-bold pb-5">Learning center:</p>
  <div class="bg-charcoal-800 p-4 rounded-lg">
    <Carousel cards="{guides}" let:card>
      <GuideCard guide="{card}" />
    </Carousel>
  </div>
</div>
