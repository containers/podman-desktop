<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

import { providerInfos } from '../../stores/providers';
import { onMount } from 'svelte';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { router } from 'tinro';
import Modal from '../dialogs/Modal.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import { writeToTerminal } from './Util';
import PreferencesConnectionCreationRendering from './PreferencesConnectionCreationRendering.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import Route from '../../Route.svelte';
import { faHistory, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import type { Terminal } from 'xterm';
import Button from '../ui/Button.svelte';
import FormPage from '../ui/FormPage.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string | undefined = undefined;
export let taskId: number | undefined = undefined;

let showModalProviderInfo: ProviderInfo | undefined = undefined;

let providerLifecycleError = '';
router.subscribe(() => {
  providerLifecycleError = '';
});

let providers: ProviderInfo[] = [];
onMount(() => {
  providerLifecycleError = '';
  providerInfos.subscribe(value => {
    providers = value;
  });
});

let providerInfo: ProviderInfo;
$: providerInfo = providers.filter(provider => provider.internalId === providerInternalId)[0];

let providerDisplayName: string;
$: providerDisplayName =
  (providerInfo?.containerProviderConnectionCreation
    ? providerInfo?.containerProviderConnectionCreationDisplayName || undefined
    : providerInfo?.kubernetesProviderConnectionCreation
      ? providerInfo?.kubernetesProviderConnectionCreationDisplayName
      : undefined) || providerInfo?.name;

let logsTerminal: Terminal;

async function startProvider(): Promise<void> {
  await window.startProviderLifecycle(providerInfo.internalId);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
}

async function stopProvider(): Promise<void> {
  await window.stopProviderLifecycle(providerInfo.internalId);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
}

async function startReceivingLogs(providerInternalId: string): Promise<void> {
  const logHandler = (newContent: any[]) => {
    writeToTerminal(logsTerminal, newContent, '\x1b[37m');
  };
  window.startReceiveLogs(providerInternalId, logHandler, logHandler, logHandler);
}

async function stopReceivingLogs(providerInternalId: string): Promise<void> {
  await window.stopReceiveLogs(providerInternalId);
}
</script>

<Route path="/*" breadcrumb="{providerInfo?.name}" navigationHint="details">
  <FormPage title="Create a {providerDisplayName}">
    <svelte:fragment slot="icon">
      {#if providerInfo?.images?.icon}
        {#if typeof providerInfo.images.icon === 'string'}
          <img src="{providerInfo.images.icon}" alt="{providerInfo.name}" class="max-h-10" />
          <!-- TODO check theme used for image, now use dark by default -->
        {:else}
          <img src="{providerInfo.images.icon.dark}" alt="{providerInfo.name}" class="max-h-10" />
        {/if}
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="actions">
      <!-- Manage lifecycle-->
      {#if providerInfo?.lifecycleMethods}
        <div class="pl-1 py-2 px-6">
          <div class="text-sm italic text-gray-700">Status</div>
          <div class="pl-3">{providerInfo.status}</div>
        </div>

        <div class="py-2 px-6 flex flex:row">
          <!-- start is enabled only in stopped mode-->
          {#if providerInfo?.lifecycleMethods.includes('start')}
            <div class="px-2 text-sm italic text-gray-700">
              <Button disabled="{providerInfo.status !== 'stopped'}" on:click="{() => startProvider()}" icon="{faPlay}">
                Start
              </Button>
            </div>
          {/if}

          <!-- stop is enabled only in started mode-->
          {#if providerInfo.lifecycleMethods.includes('stop')}
            <div class="px-2 text-sm italic text-gray-700">
              <Button disabled="{providerInfo.status !== 'started'}" on:click="{() => stopProvider()}" icon="{faStop}">
                Stop
              </Button>
            </div>
          {/if}
          <div class="px-2 text-sm italic text-gray-700">
            <Button
              on:click="{() => {
                showModalProviderInfo = providerInfo;
                // startReceivinLogs(providerInfo);
              }}"
              icon="{faHistory}">
              Show Logs
            </Button>
          </div>

          {#if providerLifecycleError}
            <ErrorMessage error="{providerLifecycleError}" />
          {/if}
        </div>
      {/if}
    </svelte:fragment>

    <div slot="content" class="p-5 min-w-full h-fit">
      <div class="bg-charcoal-700 px-6 py-4">
        <!-- Create connection panel-->
        {#if providerInfo?.containerProviderConnectionCreation === true}
          <PreferencesConnectionCreationRendering
            providerInfo="{providerInfo}"
            properties="{properties}"
            propertyScope="ContainerProviderConnectionFactory"
            callback="{window.createContainerProviderConnection}"
            taskId="{taskId}" />
        {/if}

        <!-- Create connection panel-->
        {#if providerInfo?.kubernetesProviderConnectionCreation === true}
          <PreferencesConnectionCreationRendering
            providerInfo="{providerInfo}"
            properties="{properties}"
            propertyScope="KubernetesProviderConnectionFactory"
            callback="{window.createKubernetesProviderConnection}"
            taskId="{taskId}" />
        {/if}
      </div>
    </div>
  </FormPage>
</Route>
{#if showModalProviderInfo}
  {@const showModalProviderInfoInternalId = showModalProviderInfo.internalId}
  <Modal
    on:close="{() => {
      stopReceivingLogs(showModalProviderInfoInternalId);
      showModalProviderInfo = undefined;
    }}">
    <div id="log" style="height: 400px; width: 647px;">
      <div style="width:100%; height:100%; flexDirection: column;">
        <TerminalWindow
          bind:terminal="{logsTerminal}"
          on:init="{() => startReceivingLogs(showModalProviderInfoInternalId)}" />
      </div>
    </div>
  </Modal>
{/if}
