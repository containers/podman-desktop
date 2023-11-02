<script lang="ts">
export let title: string;
export let selected: boolean;
</script>

<button
  on:click
  class="pb-2 border-b-[3px] border-charcoal-700 whitespace-nowrap hover:cursor-pointer px-4 py-2 text-gray-600 no-underline"
  class:border-purple-500="{selected}"
  class:hover:border-charcoal-100="{!selected}"
  class:text-white="{selected}"
  >{title}
</button>
