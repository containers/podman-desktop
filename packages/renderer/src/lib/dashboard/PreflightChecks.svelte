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
  <div class="flex flex-col w-full mt-5 px-5 pt-5 pb-1 rounded-lg bg-zinc-600">
    {#each preflightChecks as preCheck}
      <div class="flex flex-row mb-4">
        <div>
          {#if preCheck.successful === undefined}
            <svg class="pf-c-spinner pf-m-sm" role="progressbar" viewBox="0 0 100 100" aria-label="Checkin...">
              <circle class="pf-c-spinner__path" cx="50" cy="50" r="45" fill="none"></circle>
            </svg>
          {:else}
            {preCheck.successful ? '✅' : '❌'}
          {/if}          
        </div>
        <div class="flex flex-col ml-1">
          <span>{preCheck.name}</span>
          {#if preCheck.description}
          <div class="flex flex-col mt-2 basis-1/4">
            <span>Details:</span>
            <span class="text-gray-500 w-full mt-0.5">{preCheck.description}</span>
            {#if preCheck.docLinks}
              <div class="flex flex-row mt-0.5">
                <span class="mr-1">See:</span>
                {#each preCheck.docLinks as link}
                  <a href="{link.url}" target="_blank" class="mr-1" on:click="{e => openLink(e, link.url)}">{link.title}</a>
                {/each}
              </div>              
            {/if}
          </div>          
        {/if}
        </div>
        
      </div>
    {/each}
  </div>
{/if}
