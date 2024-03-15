<script lang="ts">
import { faPen } from '@fortawesome/free-solid-svg-icons';
import type { ProxySettings } from '@podman-desktop/api';
import { Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import ErrorMessage from '/@/lib/ui/ErrorMessage.svelte';

import Button from '../ui/Button.svelte';
import SettingsPage from './SettingsPage.svelte';
import { validateProxyAddress } from './Util';

let proxySettings: ProxySettings;
let proxyState: boolean;
let httpProxyError: string | undefined;
let httpsProxyError: string | undefined;

onMount(async () => {
  proxySettings = await window.getProxySettings();
  proxyState = await window.isProxyEnabled();
});

async function updateProxySettings() {
  await window.updateProxySettings(proxySettings);

  // loop over all providers and container connections to see if there are any running engines
  const providerInfos = await window.getProviderInfos();
  const runningProviders =
    providerInfos.filter(p => p.containerConnections.filter(c => c.status !== 'stopped').length > 0).length > 0;

  // show a simple message to confirm that the settings are applied,
  // or a longer warning if the user may need to take action
  let message = 'Proxy settings have been applied.';
  let type = 'info';
  if (runningProviders) {
    message += ' You might need to restart running container engines for the changes to take effect.';
    type = 'warning';
  }

  window.showMessageBox({
    title: 'Proxy Settings',
    type: type,
    message: message,
    buttons: ['OK'],
  });
}

async function updateProxyState() {
  await window.setProxyState(proxyState);
}

function validate(event: any) {
  if (event.target.id === 'httpProxy' || event.target.id === 'httpsProxy') {
    const error = validateProxyAddress(event.target.value);
    if (event.target.id === 'httpProxy') {
      httpProxyError = error;
    } else {
      httpsProxyError = error;
    }
  }
}
</script>

<SettingsPage title="Proxy Settings">
  <div class="flex flex-col bg-charcoal-600 rounded-md p-3 space-y-2">
    <!-- if proxy is not enabled, display a toggle -->

    <label for="toggle-proxy" class="inline-flex relative items-center mt-1 mb-4 cursor-pointer">
      <input
        type="checkbox"
        bind:checked="{proxyState}"
        on:change="{() => updateProxyState()}"
        id="toggle-proxy"
        class="sr-only peer" />
      <div
        class="w-9 h-5 rounded-full peer bg-zinc-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all border-gray-900 peer-checked:bg-violet-600">
      </div>
      <span class="ml-3 text-sm font-medium text-gray-400"
        >Proxy configuration {proxyState ? 'enabled' : 'disabled'}</span>
    </label>

    {#if proxySettings}
      <div class="space-y-2">
        <label for="httpProxy" class="mb-2 text-sm font-medium {proxyState ? 'text-gray-400' : 'text-gray-900'}"
          >Web Proxy (HTTP):</label>
        <Input
          name="httpProxy"
          id="httpProxy"
          disabled="{!proxyState}"
          bind:value="{proxySettings.httpProxy}"
          placeholder="URL of the proxy for http: URLs (eg http://myproxy.domain.com:8080)"
          required
          on:input="{event => validate(event)}" />
        {#if httpProxyError}
          <ErrorMessage error="{httpProxyError}" />
        {/if}
      </div>
      <div class="space-y-2">
        <label for="httpsProxy" class="pt-4 mb-2 text-sm font-medium {proxyState ? 'text-gray-400' : 'text-gray-900'}"
          >Secure Web Proxy (HTTPS):</label>
        <Input
          name="httpsProxy"
          id="httpsProxy"
          disabled="{!proxyState}"
          bind:value="{proxySettings.httpsProxy}"
          placeholder="URL of the proxy for https: URLs (eg http://myproxy.domain.com:8080)"
          required
          on:input="{event => validate(event)}" />
        {#if httpsProxyError}
          <ErrorMessage error="{httpsProxyError}" />
        {/if}
      </div>
      <div class="space-y-2">
        <label for="httpProxy" class="pt-4 mb-2 text-sm font-medium {proxyState ? 'text-gray-400' : 'text-gray-900'}"
          >Bypass proxy settings for these hosts and domains:</label>
        <Input
          name="noProxy"
          id="noProxy"
          disabled="{!proxyState}"
          bind:value="{proxySettings.noProxy}"
          placeholder="Example: *.domain.com, 192.168.*.*"
          required />
      </div>
      <div class="my-2 pt-4">
        <Button on:click="{() => updateProxySettings()}" disabled="{!proxyState}" class="w-full" icon="{faPen}">
          Update
        </Button>
      </div>
    {/if}
  </div>
</SettingsPage>
