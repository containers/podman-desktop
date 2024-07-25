<script lang="ts">
import { Input } from '..';

export let title: string;
export let searchTerm: string = '';
</script>

<Input
  class={$$props.class || ''}
  id="search-{title}"
  name="search-{title}"
  placeholder="Search {title}..."
  bind:value={searchTerm}
  aria-label="search {title}"
  clearable
  on:input>
  <svelte:fragment slot="left">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-4 h-4 mx-1 text-gray-700"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      role="img">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
  </svelte:fragment>
</Input>
