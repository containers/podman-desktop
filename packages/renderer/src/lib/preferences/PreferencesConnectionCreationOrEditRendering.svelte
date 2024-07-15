<script lang="ts">
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import type { AuditRequestItems, AuditResult, ConfigurationScope } from '@podman-desktop/api';
import { Button, EmptyScreen, ErrorMessage, LinearProgress, Spinner } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { get, type Unsubscriber } from 'svelte/store';
import { router } from 'tinro';
import type { Terminal } from 'xterm';

import type { ContextUI } from '/@/lib/context/context';
import { context } from '/@/stores/context';
/* eslint-enable import/no-duplicates */
import { operationConnectionsInfo } from '/@/stores/operation-connections';
import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '/@api/provider-info';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import Markdown from '../markdown/Markdown.svelte';
import AuditMessageBox from '../ui/AuditMessageBox.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import EditableConnectionResourceItem from './item-formats/EditableConnectionResourceItem.svelte';
import {
  clearCreateTask,
  type ConnectionCallback,
  disconnectUI,
  eventCollect,
  reconnectUI,
  startTask,
} from './preferences-connection-rendering-task';
import PreferencesRenderingItemFormat from './PreferencesRenderingItemFormat.svelte';
import { calcHalfCpuCores, getInitialValue, isPropertyValidInContext, writeToTerminal } from './Util';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInfo: ProviderInfo;
export let propertyScope: string;
export let callback: (
  param: string,
  data: any,
  handlerKey: symbol,
  collect: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void,
  tokenId?: number,
) => Promise<void>;
export let taskId: number | undefined = undefined;
export let disableEmptyScreen = false;
export let hideCloseButton = false;
export let connectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo | undefined = undefined;
export let inProgress = false;

$: configurationValues = new Map<string, { modified: boolean; value: string | boolean | number }>();
let operationStarted = false;
let operationSuccessful = false;
let operationCancelled = false;
let operationFailed = false;
export let pageIsLoading = true;
let showLogs = false;
let tokenId: number | undefined;

const providerDisplayName =
  (providerInfo.containerProviderConnectionCreation
    ? providerInfo.containerProviderConnectionCreationDisplayName ?? undefined
    : providerInfo.kubernetesProviderConnectionCreation
      ? providerInfo.kubernetesProviderConnectionCreationDisplayName
      : undefined) ?? providerInfo.name;

let osMemory: string;
let osCpu: string;
let osFreeDisk: string;

// get only ContainerProviderConnectionFactory scope fields that are starting by the provider id
let configurationKeys: IConfigurationPropertyRecordedSchema[] = [];

let isValid = true;
let errorMessage: string | undefined = undefined;

let formEl: HTMLFormElement;

let globalContext: ContextUI;

let connectionAuditResult: AuditResult | undefined;
$: connectionAuditResult = undefined;

let contextsUnsubscribe: Unsubscriber;

const buttonLabel = connectionInfo ? 'Update' : 'Create';
const operationLabel = connectionInfo ? 'Update' : 'Creation';

// reconnect the logger handler
$: if (logsTerminal && loggerHandlerKey) {
  try {
    reconnectUI(loggerHandlerKey, getLoggerHandler());
  } catch (error) {
    console.error('error while reconnecting', error);
  }
}

onMount(async () => {
  osMemory = await window.getOsMemory();
  osCpu = await window.getOsCpu();
  osFreeDisk = await window.getOsFreeDiskSize();
  contextsUnsubscribe = context.subscribe(value => (globalContext = value));

  // check if we have an existing action
  const operationConnectionInfoMap = get(operationConnectionsInfo);

  if (taskId && operationConnectionInfoMap?.has(taskId)) {
    const value = operationConnectionInfoMap.get(taskId);
    if (value) {
      loggerHandlerKey = value.operationKey;
      providerInfo = value.providerInfo;
      connectionInfo = value.connectionInfo;
      properties = value.properties;
      propertyScope = value.propertyScope;

      // set the flag as before
      inProgress = value.operationInProgress;
      operationStarted = value.operationStarted;
      errorMessage = value.errorMessage;
      operationSuccessful = value.operationSuccessful;
      tokenId = value.tokenId;
    }
  }

  configurationKeys = properties
    .filter(property =>
      Array.isArray(property.scope) ? property.scope.find(s => s === propertyScope) : property.scope === propertyScope,
    )
    .filter(property => property.id?.startsWith(providerInfo.id))
    .filter(property => isPropertyValidInContext(property.when, globalContext))
    .map(property => {
      switch (property.default) {
        case 'HOST_HALF_CPU_CORES': {
          if (osCpu) {
            property.default = calcHalfCpuCores(osCpu);
          }
          break;
        }
        default: {
          break;
        }
      }
      switch (property.maximum) {
        case 'HOST_TOTAL_DISKSIZE': {
          if (osFreeDisk) {
            property.maximum = osFreeDisk;
          }
          break;
        }
        case 'HOST_TOTAL_MEMORY': {
          if (osMemory) {
            property.maximum = osMemory;
          }
          break;
        }
        case 'HOST_TOTAL_CPU': {
          if (osCpu) {
            property.maximum = osCpu;
          }
          break;
        }
        default: {
          break;
        }
      }
      return property;
    });
  if (connectionInfo) {
    configurationKeys = configurationKeys.filter(property => !property.readonly);
  }

  if (taskId === undefined) {
    taskId = operationConnectionInfoMap.size + 1;
  }

  const data: any = {};
  for (let field of configurationKeys) {
    const id = field.id;
    if (id) {
      data[id] = field.default;
    }
  }
  if (!connectionInfo) {
    try {
      connectionAuditResult = await window.auditConnectionParameters(providerInfo.internalId, data);
    } catch (e: any) {
      console.warn(e.message);
    }
  }
  pageIsLoading = false;
});

onDestroy(() => {
  if (loggerHandlerKey) {
    disconnectUI(loggerHandlerKey);
  }
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});

function handleInvalidComponent() {
  isValid = false;
}

async function handleValidComponent() {
  isValid = true;

  const formData = new FormData(formEl);
  const data: { [key: string]: FormDataEntryValue } = {};
  for (let field of formData) {
    const [key, value] = field;
    data[key] = value;
  }

  try {
    connectionAuditResult = await window.auditConnectionParameters(providerInfo.internalId, data as AuditRequestItems);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.warn(err.message);
    } else {
      console.warn(String(err));
    }
  }
}

function internalSetConfigurationValue(id: string, modified: boolean, value: string | boolean | number) {
  const item = configurationValues.get(id);
  if (item) {
    item.modified = modified;
    item.value = value;
  } else {
    configurationValues.set(id, { modified, value });
  }
  configurationValues = configurationValues;
}

function setConfigurationValue(id: string, value: string | boolean | number) {
  internalSetConfigurationValue(id, true, value);
}

async function getConfigurationValue(configurationKey: IConfigurationPropertyRecordedSchema): Promise<any> {
  if (configurationKey?.id) {
    if (connectionInfo) {
      const value = await window.getConfigurationValue(
        configurationKey.id,
        connectionInfo as unknown as ConfigurationScope,
      );
      internalSetConfigurationValue(configurationKey.id, false, value as string);
      return value;
    }
    const initialValue = await getInitialValue(configurationKey);
    internalSetConfigurationValue(configurationKey.id, false, initialValue as string);
    return initialValue;
  }
}

let logsTerminal: Terminal;
let loggerHandlerKey: symbol | undefined = undefined;

function getLoggerHandler(): ConnectionCallback {
  return {
    log: args => {
      writeToTerminal(logsTerminal, args, '\x1b[37m');
    },
    warn: args => {
      writeToTerminal(logsTerminal, args, '\x1b[33m');
    },
    error: args => {
      operationFailed = true;
      writeToTerminal(logsTerminal, args, '\x1b[1;31m');
    },
    onEnd: () => {
      ended();
    },
  };
}

async function ended() {
  inProgress = false;
  tokenId = undefined;
  if (!operationCancelled && !operationFailed) {
    window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
    operationSuccessful = true;
  }
  updateStore();
}

async function cleanup() {
  // clear
  if (loggerHandlerKey) {
    clearCreateTask(loggerHandlerKey);
    loggerHandlerKey = undefined;
  }
  errorMessage = undefined;
  showLogs = false;
  inProgress = false;
  operationStarted = false;
  operationFailed = false;
  operationCancelled = false;
  operationSuccessful = false;
  updateStore();
  logsTerminal?.clear();
}

// store the key
function updateStore() {
  operationConnectionsInfo.update(map => {
    if (taskId && loggerHandlerKey) {
      map.set(taskId, {
        operationKey: loggerHandlerKey,
        providerInfo,
        connectionInfo,
        properties,
        propertyScope,
        operationInProgress: inProgress,
        operationSuccessful: operationSuccessful,
        operationStarted: operationStarted,
        errorMessage: errorMessage ?? '',
        tokenId,
      });
    }
    return map;
  });
}

async function handleOnSubmit(e: any) {
  errorMessage = undefined;
  const formData = new FormData(e.target);

  const data: { [key: string]: unknown } = {};

  // handle checkboxes that are not submitted in case of unchecked
  // get all configuration keys
  configurationKeys.forEach(key => {
    // do we have the value in the form
    if (key.id && !formData.has(key.id) && key.type === 'boolean') {
      data[key.id] = false;
    }
  });

  for (let field of formData) {
    const [key, value] = field;
    let updatedValue: unknown = value;
    const configurationDef = configurationKeys.find(configKey => configKey.id === key);
    if (!connectionInfo || configurationValues.get(key)?.modified) {
      // definition of the key
      // update the value to be true and not on
      if (configurationDef?.type === 'boolean' && value === 'on') {
        updatedValue = true;
      }
      data[key] = updatedValue;
    }
  }

  // send the data to the right provider
  inProgress = true;
  operationStarted = true;
  operationFailed = false;
  operationCancelled = false;

  try {
    tokenId = await window.getCancellableTokenSource();
    // clear terminal
    logsTerminal?.clear();
    loggerHandlerKey = startTask(
      connectionInfo ? `Update ${providerDisplayName} ${connectionInfo.name}` : `Create ${providerDisplayName}`,
      `/preferences/provider-task/${providerInfo.internalId}/${taskId}`,
      getLoggerHandler(),
    );
    updateStore();
    await callback(providerInfo.internalId, data, loggerHandlerKey, eventCollect, tokenId);
  } catch (error: any) {
    //display error
    tokenId = undefined;
    // filter cancellation message to avoid displaying error and allow user to restart the creation
    if (error.message && error.message.indexOf('Execution cancelled') >= 0) {
      errorMessage = 'Action cancelled. See logs for more details';
      return;
    }
    errorMessage = error;
    operationStarted = false;
    inProgress = false;
  }
}

async function cancelCreation() {
  if (tokenId) {
    await window.cancelToken(tokenId);
    operationCancelled = true;
    tokenId = undefined;
  }
  window.telemetryTrack(
    connectionInfo ? 'updateProviderConnectionRequestUserCanceled' : 'createNewProviderConnectionRequestUserCanceled',
    {
      providerId: providerInfo.id,
      name: providerInfo.name,
    },
  );
}

async function closePanel() {
  cleanup();
}

function closePage() {
  router.goto('/preferences/resources');
  window.telemetryTrack(
    connectionInfo ? 'updateProviderConnectionPageUserClosed' : 'createNewProviderConnectionPageUserClosed',
    {
      providerId: providerInfo.id,
      name: providerInfo.name,
    },
  );
}

function getConnectionResourceConfigurationValue(
  configurationKey: IConfigurationPropertyRecordedSchema,
  configurationValues: Map<string, { modified: boolean; value: string | boolean | number }>,
): number | undefined {
  if (configurationKey.id && configurationValues.has(configurationKey.id)) {
    const value = configurationValues.get(configurationKey.id);
    if (typeof value?.value === 'number') {
      return value.value;
    }
  }
  return undefined;
}
</script>

<div class="flex flex-col w-full h-full overflow-hidden">
  {#if operationSuccessful && !disableEmptyScreen}
    <EmptyScreen icon="{faCubes}" title="{operationLabel}" message="Successful operation">
      <Button
        class="py-3"
        on:click="{() => {
          cleanup();
          router.goto('/preferences/resources');
        }}">
        Go back to resources
      </Button>
    </EmptyScreen>
  {:else}
    <div class="flex flex-col px-6 w-full h-full overflow-auto">
      {#if pageIsLoading}
        <div class="text-center mt-16 p-2" role="status">
          <Spinner size="2em" />
        </div>
      {:else}
        {#if operationStarted || errorMessage}
          <div class="w-4/5">
            <div class="mt-2 mb-8">
              {#if inProgress}
                <LinearProgress />
              {/if}
              <div class="mt-2 float-right">
                <button
                  aria-label="Show Logs"
                  class="text-xs mr-3 hover:underline"
                  on:click="{() => (showLogs = !showLogs)}"
                  >Show Logs <i class="fas {showLogs ? 'fa-angle-up' : 'fa-angle-down'}" aria-hidden="true"></i
                  ></button>
                <button
                  aria-label="Cancel {operationLabel.toLowerCase()}"
                  class="text-xs {errorMessage ? 'mr-3' : ''} hover:underline {tokenId ? '' : 'hidden'}"
                  disabled="{!tokenId}"
                  on:click="{cancelCreation}">Cancel</button>
                <button
                  class="text-xs hover:underline {inProgress ? 'hidden' : ''}"
                  aria-label="Close panel"
                  on:click="{closePanel}">Close</button>
              </div>
            </div>
            <div id="log" class="pt-2 h-80 {showLogs ? '' : 'hidden'}">
              <div class="w-full h-full">
                <TerminalWindow bind:terminal="{logsTerminal}" />
              </div>
            </div>
          </div>
        {/if}
        {#if errorMessage}
          <div class="pt-3 mt-2 w-4/5 h-fit">
            <ErrorMessage error="{errorMessage}" />
          </div>
        {/if}

        <div class="p-3 mt-2 w-4/5 h-fit {inProgress ? 'opacity-40 pointer-events-none' : ''}">
          {#if connectionAuditResult && (connectionAuditResult.records?.length ?? 0) > 0}
            <AuditMessageBox auditResult="{connectionAuditResult}" />
          {/if}
          <form
            novalidate
            class="p-2 space-y-7 h-fit"
            on:submit|preventDefault="{handleOnSubmit}"
            bind:this="{formEl}"
            aria-label="Properties Information">
            {#each configurationKeys as configurationKey}
              <div class="mb-2.5">
                <div class="flex flex-row items-center h-[30px]">
                  {#if configurationKey.description}
                    {configurationKey.description}:
                  {:else if configurationKey.markdownDescription && configurationKey.type !== 'markdown'}
                    <Markdown markdown="{configurationKey.markdownDescription}" />
                  {/if}
                  {#if configurationKey.format === 'memory' || configurationKey.format === 'diskSize' || configurationKey.format === 'cpu'}
                    <div class="text-gray-600">
                      <EditableConnectionResourceItem
                        record="{configurationKey}"
                        value="{getConnectionResourceConfigurationValue(configurationKey, configurationValues)}"
                        onSave="{setConfigurationValue}" />
                    </div>
                  {/if}
                </div>
                {#if configurationValues}
                  <PreferencesRenderingItemFormat
                    invalidRecord="{handleInvalidComponent}"
                    validRecord="{handleValidComponent}"
                    record="{configurationKey}"
                    setRecordValue="{setConfigurationValue}"
                    enableSlider="{true}"
                    initialValue="{getConfigurationValue(configurationKey)}"
                    givenValue="{getConnectionResourceConfigurationValue(configurationKey, configurationValues)}" />
                {/if}
              </div>
            {/each}
            <div class="w-full">
              <div class="float-right">
                {#if !hideCloseButton}
                  <Button type="link" aria-label="Close page" on:click="{closePage}">Close</Button>
                {/if}
                <Button disabled="{!isValid}" inProgress="{inProgress}" on:click="{() => formEl.requestSubmit()}"
                  >{buttonLabel}</Button>
              </div>
            </div>
          </form>
        </div>
      {/if}
    </div>
  {/if}
</div>
