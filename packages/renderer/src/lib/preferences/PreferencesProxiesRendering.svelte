<script lang="ts">
import { faPen } from '@fortawesome/free-solid-svg-icons';
import type { ProxySettings } from '@podman-desktop/api';
import { Button, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import SlideToggle from '../ui/SlideToggle.svelte';
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

async function updateProxyState(state: boolean) {
  await window.setProxyState(state);
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

    <SlideToggle id="toggle-proxy" bind:checked={proxyState} on:checked={event => updateProxyState(event.detail)}
      >Proxy configuration {proxyState ? 'enabled' : 'disabled'}</SlideToggle>

    {#if proxySettings}
      <div class="space-y-2">
        <label
          for="httpProxy"
          class="mb-2 font-medium {proxyState ? 'text-[var(--pd-invert-content-card-text)]' : 'text-gray-900'}"
          >Web Proxy (HTTP):</label>
        <Input
          name="httpProxy"
          id="httpProxy"
          disabled={!proxyState}
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
          class="pt-4 mb-2 font-medium {proxyState ? 'text-[var(--pd-invert-content-card-text)]' : 'text-gray-900'}"
          >Secure Web Proxy (HTTPS):</label>
        <Input
          name="httpsProxy"
          id="httpsProxy"
          disabled={!proxyState}
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
          class="pt-4 mb-2 font-medium {proxyState ? 'text-[var(--pd-invert-content-card-text)]' : 'text-gray-900'}"
          >Bypass proxy settings for these hosts and domains:</label>
        <Input
          name="noProxy"
          id="noProxy"
          disabled={!proxyState}
          bind:value={proxySettings.noProxy}
          placeholder="Example: *.domain.com, 192.168.*.*"
          required />
      </div>
      <div class="my-2 pt-4">
        <Button on:click={() => updateProxySettings()} disabled={!proxyState} class="w-full" icon={faPen}>
          Update
        </Button>
      </div>
    {/if}
  </div>
</SettingsPage>
