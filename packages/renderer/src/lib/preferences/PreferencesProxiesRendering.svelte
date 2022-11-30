<script lang="ts">
import { providerInfos } from '../../stores/providers';

import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';

function updateProvider(provider: ProviderInfo) {
  window.updateProviderProxySettings(provider.internalId, provider.proxySettings);
}
</script>

<div class="flex flex-1 flex-col p-2 bg-zinc-800">
  <h1 class="capitalize text-xl">Proxy settings</h1>

  <div class="container mx-auto">
    {#each $providerInfos as provider}
      {#if provider.proxySettings}
        <div class="bg-zinc-700 rounded-md m-2 p-2">
          <div class="flex flex-row items-center">
            <div class="text-lg text-gray-100">{provider.name} Provider</div>

            {#if provider.containerConnections.length > 0}
              <div class="ml-2 text-xs text-gray-400 font-thin">
                ({provider.containerConnections.map(connection => connection.name).join(',')})
              </div>
            {/if}
          </div>

          <div>
            <label for="httpProxy" class="block mt-2 mb-1 text-sm font-medium text-gray-300">Web Proxy (HTTP):</label>
            <input
              name="{provider.id}-httpProxy"
              id="{provider.id}-httpProxy"
              bind:value="{provider.proxySettings.httpProxy}"
              class=" text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
              required />
          </div>
          <div>
            <label for="httpsProxy" class="block mt-2 mb-1  text-sm font-medium text-gray-300"
              >Secure Web Proxy (HTTPS):</label>
            <input
              name="{provider.id}-httpsProxy"
              id="{provider.id}-httpsProxy"
              bind:value="{provider.proxySettings.httpsProxy}"
              class=" text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
              required />
          </div>
          <div>
            <label for="httpProxy" class="block mt-2 mb-1 text-sm font-medium text-gray-300"
              >Bypass proxy settings for these hosts and domains:</label>
            <input
              name="{provider.id}-noProxy"
              id="{provider.id}-noProxy"
              bind:value="{provider.proxySettings.noProxy}"
              placeholder="Example: *.domain.com, 192.168.*.*"
              class=" text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
              required />
          </div>
          <div class="my-2">
            <button on:click="{() => updateProvider(provider)}" class="w-full pf-c-button pf-m-primary" type="button">
              <span class="pf-c-button__icon pf-m-start">
                <i class="fas fa-pen" aria-hidden="true"></i>
              </span>
              Update
            </button>
          </div>
        </div>
      {/if}
    {/each}
  </div>
</div>
