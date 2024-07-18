<script lang="ts">
import Carousel from './Carousel.svelte';
</script>

<div>
  <p class="text-lg first-letter:uppercase font-bold pb-5">Learning center:</p>
  <div class="bg-charcoal-800 p-4 rounded-lg">
    <Carousel cards={['card 1', 'card 2', 'card 3']} cardWidth={340} let:card>
      <p>{card}</p>
    </Carousel>
  </div>
</div>
