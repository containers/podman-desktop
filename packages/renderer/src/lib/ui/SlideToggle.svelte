<script lang="ts">
import { createEventDispatcher } from 'svelte';

export let checked = false;

const dispatch = createEventDispatcher();

function onInput() {
  dispatch('checked', !checked);
}
</script>

<label class="h-[20px] relative inline-flex cursor-pointer">
  <span class="text-xs {checked ? 'text-white' : 'text-gray-700'} mr-3"></span>
  <input on:input="{onInput}" class="sr-only peer" bind:checked="{checked}" type="checkbox" />
  <div
    class="w-8 h-[20px] bg-gray-900 rounded-full peer peer-checked:after:translate-x-full after:bg-charcoal-600 after:content-[''] after:absolute after:top-[4px] after:left-[16px] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-600">
  </div>
</label>
