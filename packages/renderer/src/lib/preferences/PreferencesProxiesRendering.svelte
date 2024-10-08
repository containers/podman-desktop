<script lang="ts">
import { faPen } from '@fortawesome/free-solid-svg-icons';
import type { ProxySettings } from '@podman-desktop/api';
import { Button, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import { ProxyState } from '/@api/proxy';

import SettingsPage from './SettingsPage.svelte';
import { validateProxyAddress } from './Util';

let proxySettings: ProxySettings;
let proxyState: ProxyState;
let httpProxyError: string | undefined;
let httpsProxyError: string | undefined;

onMount(async () => {
  proxySettings = await window.getProxySettings();
  proxyState = await window.getProxyState();
});

async function updateProxySettings() {
  await window.setProxyState(proxyState);
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
  <div class="flex flex-col bg-[var(--pd-invert-content-card-bg)] rounded-md p-3 space-y-2">
    <!-- if proxy is not enabled, display a toggle -->

    <label for="toggle-proxy" class="inline-flex relative items-center mt-1 mb-4 cursor-pointer"
      >Proxy configuration
      <select
        class="p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-700"
        id="toggle-proxy"
        bind:value={proxyState}>
        <option value={ProxyState.PROXY_SYSTEM}>System</option>
        <option value={ProxyState.PROXY_MANUAL}>Manual</option>
        <option value={ProxyState.PROXY_DISABLED}>Disabled</option>
      </select>
    </label>

    {#if proxySettings}
      <div class="space-y-2">
        <label
          for="httpProxy"
          class="mb-2 font-medium {proxyState === ProxyState.PROXY_MANUAL
            ? 'text-[var(--pd-invert-content-card-text)]'
            : 'text-gray-900'}">Web Proxy (HTTP):</label>
        <Input
          name="httpProxy"
          id="httpProxy"
          disabled={proxyState !== ProxyState.PROXY_MANUAL}
          bind:value={proxySettings.httpProxy}
          placeholder="URL of the proxy for http: URLs (eg http://myproxy.domain.com:8080)"
          required
          on:input={event => validate(event)} />
        {#if httpProxyError}
          <ErrorMessage error={httpProxyError} />
        {/if}
      </div>
      <div class="space-y-2">
        <label
          for="httpsProxy"
          class="pt-4 mb-2 font-medium {proxyState === ProxyState.PROXY_MANUAL
            ? 'text-[var(--pd-invert-content-card-text)]'
            : 'text-gray-900'}">Secure Web Proxy (HTTPS):</label>
        <Input
          name="httpsProxy"
          id="httpsProxy"
          disabled={proxyState !== ProxyState.PROXY_MANUAL}
          bind:value={proxySettings.httpsProxy}
          placeholder="URL of the proxy for https: URLs (eg http://myproxy.domain.com:8080)"
          required
          on:input={event => validate(event)} />
        {#if httpsProxyError}
          <ErrorMessage error={httpsProxyError} />
        {/if}
      </div>
      <div class="space-y-2">
        <label
          for="httpProxy"
          class="pt-4 mb-2 font-medium {proxyState === ProxyState.PROXY_MANUAL
            ? 'text-[var(--pd-invert-content-card-text)]'
            : 'text-gray-900'}">Bypass proxy settings for these hosts and domains:</label>
        <Input
          name="noProxy"
          id="noProxy"
          disabled={proxyState !== ProxyState.PROXY_MANUAL}
          bind:value={proxySettings.noProxy}
          placeholder="Example: *.domain.com, 192.168.*.*"
          required />
      </div>
      <div class="my-2 pt-4">
        <Button on:click={updateProxySettings} class="w-full" icon={faPen}>Update</Button>
      </div>
    {/if}
  </div>
</SettingsPage>
