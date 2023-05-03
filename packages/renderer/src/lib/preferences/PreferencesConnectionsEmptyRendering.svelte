<script lang="ts">
import Markdown from '../markdown/Markdown.svelte';

export let message = '';
export let hidden: boolean;
</script>

{#if !hidden}
  <div class="ml-6 mt-2 text-sm text-gray-300">
    <Markdown markdown="{message}" />
  </div>
{/if}
