<script lang="ts">
import LineWithLinks from './LineWithLinks.svelte';

export let message: string;
export let hidden: boolean;
let messageLines: string[] = [];
if (message) {
  messageLines = message.split('\n');
}
</script>

{#if !hidden}
  <div class="ml-6 mt-2 text-sm text-gray-300">
    {#each messageLines as line}
      <LineWithLinks lineText="{line}" />
    {/each}
  </div>
{/if}
