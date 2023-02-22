<script lang="ts">
import type { CheckStatus } from '../../../../main/src/plugin/api/provider-info';

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
        <p class="mb-4 items-center list-inside">
          {#if preCheck.successful === undefined}
            <svg class="pf-c-spinner pf-m-sm" role="progressbar" viewBox="0 0 100 100" aria-label="Checkin...">
              <circle class="pf-c-spinner__path" cx="50" cy="50" r="45" fill="none"></circle>
            </svg>
          {:else}
            {preCheck.successful ? '✅' : '❌'}
          {/if}
          {preCheck.name}
        </p>
        {#if preCheck.description}
          Details: <p class="text-gray-300 w-full break-all">{preCheck.description}</p>
          {#if preCheck.docLinks}
            See:
            {#each preCheck.docLinks as link}
              <a href="{link.url}" target="_blank" on:click="{e => openLink(e, link.url)}">{link.title}</a>
            {/each}
          {/if}
        {/if}
      </div>
    {/each}
  </div>
{/if}
