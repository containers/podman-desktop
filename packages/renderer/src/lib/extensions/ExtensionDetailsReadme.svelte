<script lang="ts">
import { faFileText } from '@fortawesome/free-solid-svg-icons';
import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import Markdown from '../markdown/Markdown.svelte';

export let readme: { content?: string; uri?: string };

let readmeContent: string | undefined = undefined;

$: readme && refreshReadme();

async function refreshReadme(): Promise<void> {
  readmeContent = undefined;
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
}

onMount(async () => {
  await refreshReadme();
});
</script>

{#if readmeContent}
  <div class="w-full min-h-full overflow-y-visible leading-6 text-[var(--pd-details-body-text)]">
    <Markdown markdown={readmeContent} />
  </div>
{:else}
  <EmptyScreen
    class="w-full h-full"
    icon={faFileText}
    title="No Readme"
    message="No readme file is available for this extension" />
{/if}
