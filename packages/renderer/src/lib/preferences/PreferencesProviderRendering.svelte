<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

import { providerInfos } from '../../stores/providers';
import { onMount } from 'svelte';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { router } from 'tinro';
import Modal from '../dialogs/Modal.svelte';
import Logger from './Logger.svelte';
import { writeToTerminal } from './Util';
import PreferencesConnectionCreationRendering from './PreferencesConnectionCreationRendering.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import Route from '../../Route.svelte';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string = undefined;
export let taskId: number = undefined;

let showModal: ProviderInfo = undefined;

let providerLifecycleError = '';
router.subscribe(async route => {
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
let waiting = false;

let logsTerminal;

async function startProvider(): Promise<void> {
  waiting = true;
  await window.startProviderLifecycle(providerInfo.internalId);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  waiting = false;
}

async function stopProvider(): Promise<void> {
  waiting = true;
  await window.stopProviderLifecycle(providerInfo.internalId);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  waiting = false;
}

async function startReceivinLogs(provider: ProviderInfo): Promise<void> {
  const logHandler = (newContent: any[]) => {
    writeToTerminal(logsTerminal, newContent, '\x1b[37m');
  };
  window.startReceiveLogs(provider.internalId, logHandler, logHandler, logHandler);
}

async function stopReceivingLogs(provider: ProviderInfo): Promise<void> {
  await window.stopReceiveLogs(provider.internalId);
}
</script>

<Route path="/*" breadcrumb="{providerInfo?.name}" let:meta>
  <div class="flex flex-1 flex-col bg-charcoal-800 px-6 py-1">
    <div>
      <button
        aria-label="Close"
        class="hover:text-gray-700 float-right text-lg"
        on:click="{() => router.goto('/preferences/resources')}">
        <Fa icon="{faXmark}" />
      </button>
    </div>
    <h1 class="capitalize text-sm">Resources > {providerInfo?.name}</h1>
    <!-- Manage lifecycle-->
    {#if providerInfo?.lifecycleMethods}
      <div class="pl-1 py-2">
        <div class="text-sm italic text-gray-700">Status</div>
        <div class="pl-3">{providerInfo.status}</div>
      </div>

      <div class="py-2 flex flex:row">
        <!-- start is enabled only in stopped mode-->
        {#if providerInfo?.lifecycleMethods.includes('start')}
          <div class="px-2 text-sm italic text-gray-700">
            <button
              disabled="{providerInfo.status !== 'stopped'}"
              on:click="{() => startProvider()}"
              class="pf-c-button pf-m-primary"
              type="button">
              <span class="pf-c-button__icon pf-m-start">
                <i class="fas fa-play" aria-hidden="true"></i>
              </span>
              Start
            </button>
          </div>
        {/if}

        <!-- stop is enabled only in started mode-->
        {#if providerInfo.lifecycleMethods.includes('stop')}
          <div class="px-2 text-sm italic text-gray-700">
            <button
              disabled="{providerInfo.status !== 'started'}"
              on:click="{() => stopProvider()}"
              class="pf-c-button pf-m-primary"
              type="button">
              <span class="pf-c-button__icon pf-m-start">
                <i class="fas fa-stop" aria-hidden="true"></i>
              </span>
              Stop
            </button>
          </div>
        {/if}
        <div class="px-2 text-sm italic text-gray-700">
          <button
            type="button"
            on:click="{() => {
              showModal = providerInfo;
              // startReceivinLogs(providerInfo);
            }}"
            class="pf-c-button pf-m-secondary">
            <span class="pf-c-button__icon pf-m-start">
              <i class="fas fa-history" aria-hidden="true"></i>
            </span>
            Show Logs
          </button>
        </div>

        {#if providerLifecycleError}
          <ErrorMessage error="{providerLifecycleError}" />
        {/if}
      </div>
    {/if}

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
</Route>
{#if showModal}
  <Modal
    on:close="{() => {
      stopReceivingLogs(showModal);
      showModal = undefined;
    }}">
    <h2 slot="header">Logs</h2>
    <div id="log" style="height: 400px; width: 647px;">
      <div style="width:100%; height:100%; flexDirection: column;">
        <Logger bind:logsTerminal="{logsTerminal}" onInit="{() => startReceivinLogs(showModal)}" />
      </div>
    </div>
  </Modal>
{/if}
