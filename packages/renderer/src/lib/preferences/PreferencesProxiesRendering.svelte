<script lang="ts">
import { type DialogType, PROXY_CONFIG_KEYS, ProxyState } from '@desktop-framework/api';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow, Dropdown, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';

import { PROXY_LABELS } from '/@/lib/preferences/proxy-state-labels';
import { manualProxySettings } from '/@/stores/manual-proxy-settings.svelte';

import PreferencesManagedInput from './PreferencesManagedInput.svelte';
import SettingsPage from './SettingsPage.svelte';
import { validateProxyAddress } from './Util';

let httpProxy = '';
let httpsProxy = '';
let noProxy = '';
let proxyState: ProxyState;
let httpProxyError: string | undefined;
let httpsProxyError: string | undefined;
let httpProxyLocked = false;
let httpsProxyLocked = false;
let noProxyLocked = false;
let proxyEnabledLocked = false;

onMount(async () => {
  proxyState = await window.getProxyState();

  // Use saved manual settings only when not in manual mode (to preserve user input across page navigations)
  const savedSettings = proxyState !== ProxyState.PROXY_MANUAL ? manualProxySettings.settings : undefined;

  if (savedSettings) {
    httpProxy = savedSettings.httpProxy;
    httpsProxy = savedSettings.httpsProxy;
    noProxy = savedSettings.noProxy;
  } else {
    const proxySettings = await window.getProxySettings();
    httpProxy = proxySettings?.httpProxy ?? '';
    httpsProxy = proxySettings?.httpsProxy ?? '';
    noProxy = proxySettings?.noProxy ?? '';
  }

  if (proxyState === ProxyState.PROXY_MANUAL) {
    manualProxySettings.settings = { httpProxy, httpsProxy, noProxy };
  }

  // Check if proxy settings are locked by managed configuration
  const configProperties = await window.getConfigurationProperties();
  proxyEnabledLocked = configProperties[PROXY_CONFIG_KEYS.ENABLED]?.locked ?? false;
  httpProxyLocked = configProperties[PROXY_CONFIG_KEYS.HTTP]?.locked ?? false;
  httpsProxyLocked = configProperties[PROXY_CONFIG_KEYS.HTTPS]?.locked ?? false;
  noProxyLocked = configProperties[PROXY_CONFIG_KEYS.NO_PROXY]?.locked ?? false;

  // If locked, ensure we display the managed configuration values
  // we "retrieve" these values instead of from the proxy settings fetched earlier, as those
  // do not reflect managed configuration overrides
  if (httpProxyLocked) {
    httpProxy = (await window.getConfigurationValue<string>(PROXY_CONFIG_KEYS.HTTP)) ?? httpProxy;
  }
  if (httpsProxyLocked) {
    httpsProxy = (await window.getConfigurationValue<string>(PROXY_CONFIG_KEYS.HTTPS)) ?? httpsProxy;
  }
  if (noProxyLocked) {
    noProxy = (await window.getConfigurationValue<string>(PROXY_CONFIG_KEYS.NO_PROXY)) ?? noProxy;
  }
});

onDestroy(() => {
  // Store manual settings to avoid losing it when switching between pages
  if (proxyState === ProxyState.PROXY_MANUAL) {
    manualProxySettings.settings = { httpProxy, httpsProxy, noProxy };
  }
});

function onProxyStateChange(key: string): void {
  for (const [state, label] of PROXY_LABELS) {
    if (label === key) {
      proxyState = state;
      return;
    }
  }
}

async function updateProxySettings(): Promise<void> {
  await window.setProxyState(proxyState);
  if (proxyState !== ProxyState.PROXY_SYSTEM) {
    await window.updateProxySettings({ httpProxy, httpsProxy, noProxy });
  }

  if (proxyState === ProxyState.PROXY_MANUAL) {
    manualProxySettings.settings = { httpProxy, httpsProxy, noProxy };
  }

  // loop over all providers and container connections to see if there are any running engines
  const providerInfos = await window.getProviderInfos();
  const runningConnections = providerInfos.flatMap(p => p.containerConnections.filter(c => c.status !== 'stopped'));
  const hasMachineConnections = runningConnections.some(c => c.vmType);
  const hasNativeConnections = runningConnections.some(c => !c.vmType);

  // show a simple message to confirm that the settings are applied,
  // or a longer warning if the user may need to take action
  let message = 'Proxy settings have been applied.';
  let type: DialogType = 'info';
  if (hasMachineConnections) {
    message +=
      ' You might need to restart the Podman machine for the changes to take effect. Running containers without a restart policy will need to be restarted manually after the machine restart.';
    type = 'warning';
  }
  if (hasNativeConnections) {
    message += ' Running containers will need to be restarted to pick up the new proxy settings.';
    type = 'warning';
  }

  await window.showMessageBox({
    title: 'Proxy Settings Updated',
    type: type,
    message: message,
    buttons: ['Dismiss'],
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validate(event: any): void {
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
  <div class="flex flex-col bg-[var(--pd-invert-content-card-bg)] rounded-md p-3 space-y-4">
    <div class="space-y-2">
      <label for="toggle-proxy" class="block font-semibold text-[var(--pd-invert-content-card-text)]"
        >Proxy configuration</label>
      <Dropdown
        id="toggle-proxy"
        disabled={proxyEnabledLocked}
        onChange={onProxyStateChange}
        value={PROXY_LABELS.get(proxyState)}
        options={Array.from(PROXY_LABELS.values()).map((label) => ({
          value: label,
          label: label,
        }))}>
      </Dropdown>
      {#if proxyEnabledLocked}
        <PreferencesManagedInput />
      {/if}
    </div>

    <div class="space-y-2">
      <label for="httpProxy" class="block font-semibold text-[var(--pd-invert-content-card-text)]"
        >Web Proxy (HTTP)</label
      >
      <Input
        name="httpProxy"
        id="httpProxy"
        disabled={proxyState !== ProxyState.PROXY_MANUAL || httpProxyLocked}
        bind:value={httpProxy}
        placeholder="URL of the proxy for http: URLs (eg http://myproxy.domain.com:8080)"
        required
        on:input={validate} />
      {#if httpProxyLocked}
        <PreferencesManagedInput />
      {/if}
      {#if httpProxyError}
        <ErrorMessage error={httpProxyError} />
      {/if}
    </div>

    <div class="space-y-2">
      <label for="httpsProxy" class="block font-semibold text-[var(--pd-invert-content-card-text)]"
        >Secure Web Proxy (HTTPS)</label
      >
      <Input
        name="httpsProxy"
        id="httpsProxy"
        disabled={proxyState !== ProxyState.PROXY_MANUAL || httpsProxyLocked}
        bind:value={httpsProxy}
        placeholder="URL of the proxy for https: URLs (eg http://myproxy.domain.com:8080)"
        required
        on:input={validate} />
      {#if httpsProxyLocked}
        <PreferencesManagedInput />
      {/if}
      {#if httpsProxyError}
        <ErrorMessage error={httpsProxyError} />
      {/if}
    </div>

    <div class="space-y-2">
      <label for="noProxy" class="block font-semibold text-[var(--pd-invert-content-card-text)]"
        >Bypass proxy settings for these hosts and domains</label
      >
      <Input
        name="noProxy"
        id="noProxy"
        disabled={proxyState !== ProxyState.PROXY_MANUAL || noProxyLocked}
        bind:value={noProxy}
        placeholder="Example: *.domain.com, 192.168.*.*"
        required />
      {#if noProxyLocked}
        <PreferencesManagedInput />
      {/if}
    </div>

    <ButtonRow class="pt-2">
      <Button on:click={updateProxySettings} title="Update" icon={faPen}>Update</Button>
    </ButtonRow>
  </div>
</SettingsPage>
