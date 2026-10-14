<script lang="ts">
import { faFileText } from '@fortawesome/free-solid-svg-icons';
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import Markdown from '/@/lib/markdown/Markdown.svelte';

interface Props {
  readme: { content?: string; uri?: string };
  extensionId: string;
}

const { readme, extensionId }: Props = $props();

const readmePromise = $derived.by(async () => {
  if (readme.content) {
    return readme.content;
  }

  if (readme.uri) {
    try {
      const text = await window.fetchCatalogReadme(extensionId);
      return text;
    } catch (error) {
      console.error(`Unable to fetch README for extension ${extensionId}`, error);
      return '';
    }
  }

  return '';
});
</script>

{#await readmePromise then readmeContent}
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
{/await}
