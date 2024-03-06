<script lang="ts">
import { onMount } from 'svelte';
import Carousel from '../carousel/Carousel.svelte';
import GuideCard from './GuideCard.svelte';
import type { Guide } from '../../../../main/src/plugin/learning-center/learning-center-api';
import Expandable from '../ui/Expandable.svelte';

let guides: Guide[] = [];

onMount(async () => {
  guides = await window.listGuides();
});
</script>

<div class="flex flex-1 flex-col bg-charcoal-800 p-5 rounded-lg">
  <Expandable title="Learning Center">
    <Carousel cards="{guides}" let:card>
      <GuideCard guide="{card}" />
    </Carousel>
  </Expandable>
</div>
