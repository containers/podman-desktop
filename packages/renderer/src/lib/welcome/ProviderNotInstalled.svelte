<script lang="ts">
import type { ProviderDetectionCheck } from '@tmpwip/extension-api';

import type { CheckStatus, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import ProviderDetectionChecksButton from './ProviderDetectionChecksButton.svelte';
import ProviderInstallationButton from './ProviderInstallationButton.svelte';
import ProviderLinks from './ProviderLinks.svelte';
import ProviderLogo from './ProviderLogo.svelte';

export let provider: ProviderInfo;

let detectionChecks: ProviderDetectionCheck[] = [];
let preflightChecks: CheckStatus[] = [];

function openLink(e: MouseEvent, url: string): void {
  e.preventDefault();
  e.stopPropagation();
  window.openExternal(url);
}
</script>

<div class="p-2 flex flex-col bg-zinc-700 rounded-lg">
  <ProviderLogo provider="{provider}" />
  <div class="flex flex-col items-center text-center">
    <p class="text-xl text-gray-300">
      Podman Desktop was not able to find an installation of {provider.name}.
    </p>
    <p class="text-base text-gray-400">
      To start working with containers, {provider.name} needs to be detected/installed.
    </p>
  </div>
  <div class="mt-10 mb-1  w-full flex  justify-around">
    <ProviderDetectionChecksButton onDetectionChecks="{checks => (detectionChecks = checks)}" provider="{provider}" />
    <ProviderInstallationButton onPreflightChecks="{checks => (preflightChecks = checks)}" provider="{provider}" />
  </div>
  {#if detectionChecks.length > 0}
    <div class="flex flex-col w-full mt-5 px-5 pt-5 pb-0 rounded-lg bg-zinc-600">
      {#each detectionChecks as detectionCheck}
        <div class="flex flex-col">
          <p class="mb-4 items-center list-inside">{detectionCheck.status ? '✅' : '❌'} {detectionCheck.name}</p>
          {#if detectionCheck.details}
            Details: <p class="text-gray-300 w-full break-all">{detectionCheck.details}</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
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
  <ProviderLinks provider="{provider}" />
</div>
