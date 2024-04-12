<script lang="ts">
import { faFileText } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';

import Markdown from '../markdown/Markdown.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';

export let readme: { content?: string; uri?: string };

let readmeContent: string = '';

onMount(async () => {
  if (readme.uri) {
    // fetch the readme file content
    const response = await fetch(readme.uri);

    if (response.ok) {
      const text = await response.text();
      readmeContent = text;
    }
  }

  if (!readmeContent && readme.content) {
    // try with extension readme
    readmeContent = readme.content;
  }

  if (!readmeContent) {
    readmeContent = '';
  }
});
</script>

{#if readmeContent}
  <div class="overflow-y-scroll leading-6">
    <Markdown markdown="{readmeContent}" />
  </div>
{:else}
  <EmptyScreen
    class="w-full h-full"
    icon="{faFileText}"
    title="No readme"
    message="No readme file is available for this extension" />
{/if}
