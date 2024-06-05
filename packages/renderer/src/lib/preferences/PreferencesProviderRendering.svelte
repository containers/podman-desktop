<script lang="ts">
import { faHistory, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage, Modal } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';
import type { Terminal } from 'xterm';

import { operationConnectionsInfo } from '/@/stores/operation-connections';
import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '/@api/provider-info';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import Route from '../../Route.svelte';
import { providerInfos } from '../../stores/providers';
import FormPage from '../ui/FormPage.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import PreferencesConnectionCreationRendering from './PreferencesConnectionCreationOrEditRendering.svelte';
import { writeToTerminal } from './Util';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string | undefined = undefined;
export let taskId: number | undefined = undefined;
let inProgress: boolean = false;

let showModalProviderInfo: ProviderInfo | undefined = undefined;

let providerLifecycleError = '';
router.subscribe(() => {
  providerLifecycleError = '';
});

let connectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo | undefined = undefined;

let providers: ProviderInfo[] = [];
onMount(() => {
  providerLifecycleError = '';
  providerInfos.subscribe(value => {
    providers = value;
  });
  operationConnectionsInfo.subscribe(operationsMap => {
    if (taskId) {
      connectionInfo = operationsMap.get(taskId)?.connectionInfo;
    }
  });
});

let providerInfo: ProviderInfo;
$: providerInfo = providers.filter(provider => provider.internalId === providerInternalId)[0];

let providerDisplayName: string;
$: providerDisplayName =
  (providerInfo?.containerProviderConnectionCreation
    ? providerInfo?.containerProviderConnectionCreationDisplayName ?? undefined
    : providerInfo?.kubernetesProviderConnectionCreation
      ? providerInfo?.kubernetesProviderConnectionCreationDisplayName
      : undefined) ?? providerInfo?.name;

let title: string;
$: title = connectionInfo ? `Update ${providerDisplayName} ${connectionInfo.name}` : `Create ${providerDisplayName}`;

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
  <FormPage title="{title}" inProgress="{inProgress}">
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

    <div slot="content" class="px-5 pb-5 min-w-full h-fit">
      <div class="bg-charcoal-700 px-6 py-4">
        <!-- Create connection panel-->
        {#if providerInfo?.containerProviderConnectionCreation === true}
          <PreferencesConnectionCreationRendering
            providerInfo="{providerInfo}"
            properties="{properties}"
            propertyScope="ContainerProviderConnectionFactory"
            callback="{window.createContainerProviderConnection}"
            taskId="{taskId}"
            bind:inProgress="{inProgress}" />
        {/if}

        <!-- Create connection panel-->
        {#if providerInfo?.kubernetesProviderConnectionCreation === true}
          <PreferencesConnectionCreationRendering
            providerInfo="{providerInfo}"
            properties="{properties}"
            propertyScope="KubernetesProviderConnectionFactory"
            callback="{window.createKubernetesProviderConnection}"
            taskId="{taskId}"
            bind:inProgress="{inProgress}" />
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
