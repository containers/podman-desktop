<script lang="ts">
import { Link, Spinner } from '@podman-desktop/ui-svelte';

import type { CheckStatus } from '/@api/provider-info';

export let preflightChecks: CheckStatus[] = [];

function openLink(url: string): void {
  window.openExternal(url);
}
</script>

{#if preflightChecks.length > 0}
  <div class="flex flex-col w-full p-2 rounded-lg bg-[var(--pd-invert-content-card-bg)]">
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
          Details: <p
            aria-label="precheck-description"
            class="text-[var(--pd-invert-content-card-text)] w-full break-all">
            {preCheck.description}
          </p>
          {#if preCheck.docLinksDescription}
            <p aria-label="precheck-docLinksDescription" class="text-[var(--pd-invert-content-card-text)] w-full">
              {preCheck.docLinksDescription}
            </p>
          {/if}
          {#if preCheck.docLinks}
            See:
            {#each preCheck.docLinks as link}
              <Link aria-label="precheck-link" on:click={() => openLink(link.url)}>{link.title}</Link>
            {/each}
          {/if}
        {/if}
      </div>
    {/each}
  </div>
{/if}
