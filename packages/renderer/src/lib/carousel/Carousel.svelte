<script lang="ts">
import { faGreaterThan, faLessThan } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import Button from '../ui/Button.svelte';

import { onDestroy, onMount } from 'svelte';

let resizeObserver: ResizeObserver;

export let cards: any[];
export let cardWidth = 250;
let cardsFit = 1;

$: visibleCards = [...cards.slice(0, cardsFit)];

function debounce(callback: any, delay = 200) {
  var time: any;
  return (...args: any[]) => {
    clearTimeout(time);
    time = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

function calcCardsToFit(width: number) {
  const cf = Math.floor(width / cardWidth);
  return cf === 0 ? 1 : cf;
}

function update(entries: any) {
  const width = entries[0].contentRect.width;
  cardsFit = calcCardsToFit(width);
}

onMount(() => {
  const initialWidth = document.getElementById('carousel-cards')?.offsetWidth as number;
  cardsFit = calcCardsToFit(initialWidth);
  resizeObserver = new ResizeObserver(debounce(update));
  resizeObserver.observe(document.getElementById('carousel-cards') as Element);
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
  {#if visibleCards.length !== cards.length}
    <button id="left" on:click="{rotateLeft}" class="h-8 w-8 mr-3 bg-gray-800 rounded-full">
      <Fa class="w-8 h-8" icon="{faLessThan}" color="black" />
    </button>
  {/if}
  {#if visibleCards.length === cards.length}
    <div class="rounded-full bg-zinc-700 text-zinc-600 h-8 w-8 mr-3 pt-2">
      <Fa class="w-8 h-8" icon="{faLessThan}" color="black" />
    </div>
  {/if}
  <div id="carousel-cards" class="flex grow gap-3">
    {#each visibleCards as card (card.id)}
      <div id="{card.id}" class="flex-1 grid bg-charcoal-600 space-y-2 hover:bg-zinc-700 pb-4 rounded-lg">
        <slot card="{card}" />
        <Button
          class="justify-self-center self-end text-lg"
          on:click="{() => window.openExternal(card.url)}"
          title="Get started">Get started</Button>
      </div>
    {/each}
  </div>
  {#if visibleCards.length !== cards.length}
    <button id="right" on:click="{rotateRight}" class="h-8 w-8 ml-3 bg-gray-800 rounded-full">
      <Fa class="h-8 w-8" icon="{faGreaterThan}" color="black" />
    </button>
  {/if}
  {#if visibleCards.length === cards.length}
    <div class="rounded-full bg-zinc-700 text-zinc-600 h-8 w-8 ml-3 pt-2">
      <Fa class="w-8 h-8" icon="{faGreaterThan}" color="black" />
    </div>
  {/if}
</div>
