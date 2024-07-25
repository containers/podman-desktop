<script lang="ts">
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { onDestroy, onMount } from 'svelte';
import Fa from 'svelte-fa';

let resizeObserver: ResizeObserver;

export let cards: any[];
export let cardWidth = 340;

let cardsFit = 1;
let containerId = Math.random().toString(36).slice(-6);

$: visibleCards = cards.slice(0, cardsFit);

function calcCardsToFit(width: number) {
  const cf = Math.floor(width / cardWidth);
  return cf === 0 ? 1 : cf;
}

function update(entries: any) {
  const width = entries[0].contentRect.width;
  cardsFit = calcCardsToFit(width);
}

onMount(() => {
  const cardsContainer = document.getElementById(`carousel-cards-${containerId}`);
  const initialWidth = cardsContainer?.offsetWidth as number;
  cardsFit = calcCardsToFit(initialWidth);
  resizeObserver = new ResizeObserver(update);
  resizeObserver.observe(cardsContainer as Element);
});

onDestroy(() => {
  resizeObserver.disconnect();
});

function rotateLeft() {
  cards = [cards[cards.length - 1], ...cards.slice(0, cards.length - 1)];
}

function rotateRight() {
  cards = [...cards.slice(1, cards.length), cards[0]];
}
</script>

<div class="flex flex-row items-center">
  <button
    id="left"
    on:click={rotateLeft}
    aria-label="Rotate left"
    class="h-8 w-8 mr-3 bg-[var(--pd-content-card-carousel-nav)] hover:bg-[var(--pd-content-card-carousel-hover-nav)] rounded-full disabled:bg-[var(--pd-content-card-carousel-disabled-nav)]"
    disabled={visibleCards.length === cards.length}>
    <Fa class="w-8 h-8" icon={faChevronLeft} color="black" />
  </button>

  <div id="carousel-cards-{containerId}" class="flex flex-grow gap-3 overflow-hidden">
    {#each visibleCards as card}
      <slot card={card} />
    {/each}
  </div>

  <button
    id="right"
    on:click={rotateRight}
    aria-label="Rotate right"
    class="h-8 w-8 ml-3 bg-[var(--pd-content-card-carousel-nav)] hover:bg-[var(--pd-content-card-carousel-hover-nav)] rounded-full disabled:bg-[var(--pd-content-card-carousel-disabled-nav)]"
    disabled={visibleCards.length === cards.length}>
    <Fa class="h-8 w-8" icon={faChevronRight} color="black" />
  </button>
</div>
