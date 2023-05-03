<script lang="ts">
import Markdown from '../markdown/Markdown.svelte';

export let message: string;
export let hidden: boolean;
let messageLines: string[] = [];
if (message) {
  messageLines = message.split('\n');
}
</script>

{#if !hidden}
  <div class="ml-6 mt-2 text-sm text-gray-300">
    <Markdown markdown="{message}" />
  </div>
{/if}
