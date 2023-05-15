<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { onMount } from 'svelte';
import { faMinus, faXmark, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';

const iconSize = '14';

export let name: string;
export let action: () => void = () => {};

let icon: IconDefinition;

let titleName;

onMount(() => {
  if (name === 'Minimize') {
    icon = faMinus;
  } else if (name === 'Maximize') {
    icon = faSquare;
  } else if (name === 'Close') {
    icon = faXmark;
  }
  titleName = name;
});
</script>

<button
  on:click="{() => action()}"
  title="{titleName}"
  aria-label="{name}"
  class="h-[25px] w-[25px] cursor-pointer text-gray-400 hover:rounded-full hover:bg-charcoal-300 flex place-items-center justify-center">
  <Fa size="{iconSize}" icon="{icon}" />
</button>
