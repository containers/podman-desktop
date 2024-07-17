<script lang="ts">
import { Spinner } from '@podman-desktop/ui-svelte';

import type { CheckStatus } from '/@api/provider-info';

export let preflightChecks: CheckStatus[] = [];

function openLink(e: MouseEvent, url: string): void {
  e.preventDefault();
  e.stopPropagation();
  window.openExternal(url);
}
</script>

{#if preflightChecks.length > 0}
  <div class="flex flex-col w-full mt-5 px-5 pt-5 pb-0 rounded-lg bg-zinc-600">
    {#each preflightChecks as preCheck}
      <div class="flex flex-col">
        <div class="mb-4 flex flex-row">
          {#if preCheck.successful === undefined}
            <div class="mr-1">
              <Spinner size="1em" />
            </div>
          {:else}
            {preCheck.successful ? '✅' : '❌'}
          {/if}
          <div aria-label="precheck-title" class="ml-2">{preCheck.name}</div>
        </div>
        {#if preCheck.description}
          Details: <p aria-label="precheck-description" class="text-gray-400 w-full break-all">
            {preCheck.description}
          </p>
          {#if preCheck.docLinksDescription}
            <p aria-label="precheck-docLinksDescription" class="text-gray-400 w-full">
              {preCheck.docLinksDescription}
            </p>
          {/if}
          {#if preCheck.docLinks}
            See:
            {#each preCheck.docLinks as link}
              <a aria-label="precheck-link" href={link.url} target="_blank" on:click={e => openLink(e, link.url)}
                >{link.title}</a>
            {/each}
          {/if}
        {/if}
      </div>
    {/each}
  </div>
{/if}
