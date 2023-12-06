<script lang="ts">
import { flip } from 'svelte/animate';
import { faGreaterThan, faLessThan } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import Button from '../ui/Button.svelte';

export let cards: any[];

const rotateLeft = () => (cards = [cards[cards.length - 1], ...cards.slice(0, cards.length - 1)]);
const rotateRight = () => (cards = [...cards.slice(1, cards.length), cards[0]]);
</script>

<div class="flex flex-row items-center">
  <button id="left" on:click="{rotateLeft}" class="h-8 w-8 mr-3 bg-gray-800 rounded-full">
    <Fa class="w-8 h-8" icon="{faLessThan}" />
  </button>
  <div id="carousel-images" class="flex width-full overflow-x-hidden justify-content-left">
    {#each cards as card (card.id)}
      <div
        animate:flip="{{ duration: 0 }}"
        id="{card.id}"
        class="min-w-[250px] max-w-[250px] p-4 space-y-4 mx-2 bg-charcoal-800 hover:bg-zinc-700 grid rounded-md">
        <slot card="{card}" />
        <Button class="justify-self-center" on:click="{() => window.openExternal(card.url)}" title="Get started"
          >Get started</Button>
      </div>
    {/each}
  </div>
  <button id="right" on:click="{rotateRight}" class="h-8 w-8 ml-3 bg-gray-800 rounded-full">
    <Fa class="h-8 w-8" icon="{faGreaterThan}" />
  </button>
</div>
