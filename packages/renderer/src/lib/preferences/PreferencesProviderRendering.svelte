<script lang="ts">
import type { ProviderConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { faHistory, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage, Modal } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import type { Terminal } from '@xterm/xterm';
import { onMount } from 'svelte';
import { router } from 'tinro';

import FormPage from '/@/lib/ui/FormPage.svelte';
import TerminalWindow from '/@/lib/ui/TerminalWindow.svelte';
import Route from '/@/Route.svelte';
import { operationConnectionsInfo } from '/@/stores/operation-connections';
import { providerInfos } from '/@/stores/providers';

import PreferencesConnectionCreationRendering from './PreferencesConnectionCreationOrEditRendering.svelte';
import { writeToTerminal } from './Util';

interface Props {
  properties?: IConfigurationPropertyRecordedSchema[];
  providerInternalId?: string;
  taskId?: number;
}

let { properties = [], providerInternalId, taskId }: Props = $props();
let inProgress: boolean = $state(false);

let showModalProviderInfo = $state<ProviderInfo>();

let providerLifecycleError = $state('');
router.subscribe(() => {
  providerLifecycleError = '';
});

let connectionInfo = $state<ProviderConnectionInfo>();

let providers: ProviderInfo[] = $state([]);
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

let providerInfo = $derived(providers.filter(provider => provider.internalId === providerInternalId)[0]);

let providerDisplayName: string = $derived(
  (providerInfo?.containerProviderConnectionCreation
    ? (providerInfo?.containerProviderConnectionCreationDisplayName ?? undefined)
    : providerInfo?.kubernetesProviderConnectionCreation
      ? providerInfo?.kubernetesProviderConnectionCreationDisplayName
      : providerInfo?.vmProviderConnectionCreation
        ? providerInfo?.vmProviderConnectionCreationDisplayName
        : undefined) ?? providerInfo?.name,
);

let title: string = $derived(
  connectionInfo ? `Update ${providerDisplayName} ${connectionInfo.name}` : `Create ${providerDisplayName}`,
);

let logsTerminal = $state<Terminal>();

async function startProvider(): Promise<void> {
  await window.startProviderLifecycle(providerInfo.internalId);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
}

async function stopProvider(): Promise<void> {
  await window.stopProviderLifecycle(providerInfo.internalId);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
}

async function startReceivingLogs(providerInternalId: string): Promise<void> {
  const logHandler = (newContent: unknown[]): void => {
    if (logsTerminal) {
      writeToTerminal(logsTerminal, newContent, '\x1b[37m');
    }
  };
  await window.startReceiveLogs(providerInternalId, logHandler, logHandler, logHandler);
}

async function stopReceivingLogs(providerInternalId: string): Promise<void> {
  await window.stopReceiveLogs(providerInternalId);
}
</script>

<Route path="/*" breadcrumb={providerInfo?.name} navigationHint="details">
  <FormPage title={title} inProgress={inProgress}>
    {#snippet icon()}
      {#if providerInfo?.images?.icon}
        <Icon icon={providerInfo.images.icon} title={providerInfo.name} class="max-h-10" />
      {/if}
    {/snippet}

    {#snippet actions()}
      <!-- Manage lifecycle-->
      {#if providerInfo?.lifecycleMethods}
        <div class="pl-1 py-2 px-6">
          <div class="text-sm italic text-[var(--pd-content-text)]">Status</div>
          <div class="pl-3">{providerInfo.status}</div>
        </div>

        <div class="py-2 px-6 flex flex:row">
          <!-- start is enabled only in stopped mode-->
          {#if providerInfo?.canStart}
            <div class="px-2 text-sm italic text-[var(--pd-content-text)]">
              <Button disabled={providerInfo.status !== 'stopped'} on:click={startProvider} icon={faPlay}>
                Start
              </Button>
            </div>
          {/if}

          <!-- stop is enabled only in started mode-->
          {#if providerInfo.canStop}
            <div class="px-2 text-sm italic text-[var(--pd-content-text)]">
              <Button disabled={providerInfo.status !== 'started'} on:click={stopProvider} icon={faStop}>
                Stop
              </Button>
            </div>
          {/if}
          <div class="px-2 text-sm italic text-[var(--pd-content-text)]">
            <Button on:click={(): ProviderInfo | undefined => (showModalProviderInfo = providerInfo)} icon={faHistory}>Show Logs</Button>
          </div>

          {#if providerLifecycleError}
            <ErrorMessage error={providerLifecycleError} />
          {/if}
        </div>
      {/if}
    {/snippet}

    {#snippet content()}
    <div class="px-5 pb-5 min-w-full h-fit">
      <div class="bg-[var(--pd-content-card-bg)] px-6 py-4">
        <!-- Create connection panel-->
        {#if providerInfo?.containerProviderConnectionCreation === true}
          <PreferencesConnectionCreationRendering
            providerInfo={providerInfo}
            properties={properties}
            propertyScope="ContainerProviderConnectionFactory"
            callback={window.createContainerProviderConnection}
            taskId={taskId}
            bind:inProgress={inProgress} />
        {/if}

        <!-- Create connection panel-->
        {#if providerInfo?.kubernetesProviderConnectionCreation === true}
          <PreferencesConnectionCreationRendering
            providerInfo={providerInfo}
            properties={properties}
            propertyScope="KubernetesProviderConnectionFactory"
            callback={window.createKubernetesProviderConnection}
            taskId={taskId}
            bind:inProgress={inProgress} />
        {/if}

        {#if providerInfo?.vmProviderConnectionCreation === true}
          <PreferencesConnectionCreationRendering
            providerInfo={providerInfo}
            properties={properties}
            propertyScope="VmProviderConnectionFactory"
            callback={window.createVmProviderConnection}
            taskId={taskId}
            bind:inProgress={inProgress} />
        {/if}
      </div>
    </div>
    {/snippet}
  </FormPage>
</Route>
{#if showModalProviderInfo}
  {@const showModalProviderInfoInternalId = showModalProviderInfo.internalId}
  <Modal
    on:close={async (): Promise<void> => {
      await stopReceivingLogs(showModalProviderInfoInternalId);
      showModalProviderInfo = undefined;
    }}>
    <div id="log" style="height: 400px; width: 647px;">
      <div style="width:100%; height:100%; flexDirection: column;">
        <TerminalWindow
          bind:terminal={logsTerminal}
          on:init={(): Promise<void> => startReceivingLogs(showModalProviderInfoInternalId)} />
      </div>
    </div>
  </Modal>
{/if}
