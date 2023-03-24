<script lang="ts">
import type { ProxySettings } from '@podman-desktop/api';
import { onMount } from 'svelte';
import SettingsPage from './SettingsPage.svelte';

let proxySettings: ProxySettings;
let proxyState: boolean;

onMount(async () => {
  proxySettings = await window.getProxySettings();
  proxyState = await window.isProxyEnabled();
});

async function updateProxySettings() {
  await window.updateProxySettings(proxySettings);
}

async function updateProxyState() {
  await window.setProxyState(proxyState);
}
</script>

<SettingsPage title="Proxy Settings">
  <div class="container mx-auto bg-zinc-800 mt-5 rounded-md p-3">
    <!-- if proxy is not enabled, display a toggle -->

    <label for="toggle-proxy" class="inline-flex relative items-center mt-2 mb-5 cursor-pointer">
      <input
        type="checkbox"
        bind:checked="{proxyState}"
        on:change="{() => updateProxyState()}"
        id="toggle-proxy"
        class="sr-only peer" />
      <div
        class="w-9 h-5 peer-focus:ring-violet-800 rounded-full peer bg-zinc-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600">
      </div>
      <span class="ml-3 text-sm font-medium text-gray-300"
        >Proxy configuration {proxyState ? 'enabled' : 'disabled'}</span>
    </label>

    {#if proxySettings}
      <div>
        <label
          for="httpProxy"
          class="block mb-2 text-sm font-medium {proxyState
            ? 'text-gray-300 dark:text-gray-300'
            : 'text-gray-500 dark:text-gray-500'}">Web Proxy (HTTP):</label>
        <input
          name="httpProxy"
          id="httpProxy"
          disabled="{!proxyState}"
          bind:value="{proxySettings.httpProxy}"
          class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
          required />
      </div>
      <div>
        <label
          for="httpsProxy"
          class="pt-4 block mb-2 text-sm font-medium {proxyState
            ? 'text-gray-300 dark:text-gray-300'
            : 'text-gray-500 dark:text-gray-500'}">Secure Web Proxy (HTTPS):</label>
        <input
          name="httpsProxy"
          id="httpsProxy"
          disabled="{!proxyState}"
          bind:value="{proxySettings.httpsProxy}"
          class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
          required />
      </div>
      <div>
        <label
          for="httpProxy"
          class="pt-4 block mb-2 text-sm font-medium {proxyState
            ? 'text-gray-300 dark:text-gray-300'
            : 'text-gray-500 dark:text-gray-500'}">Bypass proxy settings for these hosts and domains:</label>
        <input
          name="noProxy"
          id="noProxy"
          disabled="{!proxyState}"
          bind:value="{proxySettings.noProxy}"
          placeholder="Example: *.domain.com, 192.168.*.*"
          class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
          required />
      </div>
      {#if proxyState}
        <div class="my-2">
          <button on:click="{() => updateProxySettings()}" class="w-full pf-c-button pf-m-primary" type="button">
            <span class="pf-c-button__icon pf-m-start">
              <i class="fas fa-pen" aria-hidden="true"></i>
            </span>
            Update
          </button>
        </div>
      {/if}
    {/if}
  </div>
</SettingsPage>
