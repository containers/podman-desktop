<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import PreferencesRenderingItemFormat from './PreferencesRenderingItemFormat.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import { getNormalizedDefaultNumberValue, writeToTerminal } from './Util';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import {
  clearCreateTask,
  type ConnectionCallback,
  disconnectUI,
  eventCollect,
  reconnectUI,
  startTask,
} from './preferences-connection-rendering-task';
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { get, type Unsubscriber } from 'svelte/store';
import { onDestroy, onMount } from 'svelte';
/* eslint-enable import/no-duplicates */
import { createConnectionsInfo } from '/@/stores/create-connections';
import { filesize } from 'filesize';
import { router } from 'tinro';
import LinearProgress from '../ui/LinearProgress.svelte';
import Spinner from '../ui/Spinner.svelte';
import Markdown from '../markdown/Markdown.svelte';
import type { Terminal } from 'xterm';
import type { AuditRequestItems, AuditResult } from '@podman-desktop/api';
import AuditMessageBox from '../ui/AuditMessageBox.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button.svelte';
import type { ContextUI } from '/@/lib/context/context';
import { ContextKeyExpr } from '/@/lib/context/contextKey';
import { context } from '/@/stores/context';

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
export let hideProviderImage = false;
export let hideCloseButton = false;

$: configurationValues = new Map<string, string>();
let creationInProgress = false;
let creationStarted = false;
let creationSuccessful = false;
let creationCancelled = false;
let creationFailed = false;
export let pageIsLoading = true;
let showLogs = false;
let tokenId: number | undefined;

const providerDisplayName =
  (providerInfo.containerProviderConnectionCreation
    ? providerInfo.containerProviderConnectionCreationDisplayName || undefined
    : providerInfo.kubernetesProviderConnectionCreation
    ? providerInfo.kubernetesProviderConnectionCreationDisplayName
    : undefined) || providerInfo.name;

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

// reconnect the logger handler
$: if (logsTerminal && loggerHandlerKey) {
  try {
    reconnectUI(loggerHandlerKey, getLoggerHandler());
  } catch (error) {
    console.error('error while reconnecting', error);
  }
}

function isPropertyValidInContext(when: string, context: ContextUI) {
  const expr = ContextKeyExpr.deserialize(when);
  return expr?.evaluate(context);
}

onMount(async () => {
  osMemory = await window.getOsMemory();
  osCpu = await window.getOsCpu();
  osFreeDisk = await window.getOsFreeDiskSize();
  contextsUnsubscribe = context.subscribe(value => (globalContext = value));
  configurationKeys = properties
    .filter(property => property.scope === propertyScope)
    .filter(property => property.id?.startsWith(providerInfo.id))
    .filter(property => !property.when || isPropertyValidInContext(property.when, globalContext))
    .map(property => {
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

  pageIsLoading = false;

  // check if we have an existing create action
  const createConnectionInfoMap = get(createConnectionsInfo);

  if (taskId && createConnectionInfoMap && createConnectionInfoMap.has(taskId)) {
    const value = createConnectionInfoMap.get(taskId);
    if (value) {
      loggerHandlerKey = value.createKey;
      providerInfo = value.providerInfo;
      properties = value.properties;
      propertyScope = value.propertyScope;

      // set the flag as before
      creationInProgress = value.creationInProgress;
      creationStarted = value.creationStarted;
      errorMessage = value.errorMessage;
      creationSuccessful = value.creationSuccessful;
      tokenId = value.tokenId;
    }
  }
  if (taskId === undefined) {
    taskId = createConnectionInfoMap.size + 1;
  }

  const data: any = {};
  for (let field of configurationKeys) {
    const id = field.id;
    if (id) {
      data[id] = field.default;
    }
  }
  try {
    connectionAuditResult = await window.auditConnectionParameters(providerInfo.internalId, data);
  } catch (e: any) {
    console.warn(e.message);
  }
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

function setConfigurationValue(id: string, value: string) {
  configurationValues.set(id, value);
  configurationValues = configurationValues;
}

function getDisplayConfigurationValue(configurationKey: IConfigurationPropertyRecordedSchema, value?: any) {
  if (configurationKey.format === 'memory' || configurationKey.format === 'diskSize') {
    return value ? filesize(value) : filesize(getNormalizedDefaultNumberValue(configurationKey));
  } else if (configurationKey.format === 'cpu') {
    return value ? value : getNormalizedDefaultNumberValue(configurationKey);
  } else {
    return '';
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
      creationFailed = true;
      writeToTerminal(logsTerminal, args, '\x1b[1;31m');
    },
    onEnd: () => {
      ended();
    },
  };
}

async function ended() {
  creationInProgress = false;
  tokenId = undefined;
  if (!creationCancelled && !creationFailed) {
    window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
    creationSuccessful = true;
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
  creationInProgress = false;
  creationStarted = false;
  creationFailed = false;
  creationCancelled = false;
  creationSuccessful = false;
  updateStore();
  logsTerminal?.clear();
}

// store the key
function updateStore() {
  createConnectionsInfo.update(map => {
    if (taskId && loggerHandlerKey) {
      map.set(taskId, {
        createKey: loggerHandlerKey,
        providerInfo,
        properties,
        propertyScope,
        creationInProgress,
        creationSuccessful,
        creationStarted,
        errorMessage: errorMessage || '',
        tokenId,
      });
    }
    return map;
  });
}

async function handleOnSubmit(e: any) {
  errorMessage = undefined;
  const formData = new FormData(e.target);

  const data: { [key: string]: FormDataEntryValue } = {};
  for (let field of formData) {
    const [key, value] = field;
    data[key] = value;
  }

  // send the data to the right provider
  creationInProgress = true;
  creationStarted = true;
  creationFailed = false;
  creationCancelled = false;

  try {
    tokenId = await window.getCancellableTokenSource();
    // clear terminal
    logsTerminal?.clear();
    loggerHandlerKey = startTask(
      `Create ${providerDisplayName}`,
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
  }
}

async function cancelCreation() {
  if (tokenId) {
    await window.cancelToken(tokenId);
    creationCancelled = true;
    tokenId = undefined;
  }
  window.telemetryTrack('createNewProviderConnectionRequestUserCanceled', {
    providerId: providerInfo.id,
    name: providerInfo.name,
  });
}

async function closePanel() {
  cleanup();
}

function closePage() {
  router.goto('/preferences/resources');
  window.telemetryTrack('createNewProviderConnectionPageUserClosed', {
    providerId: providerInfo.id,
    name: providerInfo.name,
  });
}
</script>

<div class="flex flex-col w-full h-full overflow-hidden">
  {#if creationSuccessful && !disableEmptyScreen}
    <EmptyScreen icon="{faCubes}" title="Creation" message="Successful operation">
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
    {#if !hideProviderImage}
      <div class="my-2 px-6" aria-label="main image">
        {#if providerInfo?.images?.icon}
          {#if typeof providerInfo.images.icon === 'string'}
            <img src="{providerInfo.images.icon}" alt="{providerInfo.name}" class="max-h-10" />
            <!-- TODO check theme used for image, now use dark by default -->
          {:else}
            <img src="{providerInfo.images.icon.dark}" alt="{providerInfo.name}" class="max-h-10" />
          {/if}
        {/if}
      </div>
    {/if}
    <h1 class="font-semibold px-6 pb-2" aria-label="title">
      {creationInProgress ? 'Creating' : 'Create a'}
      {providerDisplayName}
      {creationInProgress ? '...' : ''}
    </h1>
    <div class="flex flex-col px-6 w-full h-full overflow-auto">
      {#if pageIsLoading}
        <div class="text-center mt-16" role="status">
          <Spinner size="lg" />
        </div>
      {:else}
        {#if creationStarted}
          <div class="w-4/5">
            <div class="mt-2 mb-8">
              {#if creationInProgress}
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
                  aria-label="Cancel creation"
                  class="text-xs {errorMessage ? 'mr-3' : ''} hover:underline {tokenId ? '' : 'hidden'}"
                  disabled="{!tokenId}"
                  on:click="{cancelCreation}">Cancel</button>
                <button
                  class="text-xs hover:underline {creationInProgress ? 'hidden' : ''}"
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
          <div class="w-4/5 mt-2">
            <ErrorMessage error="{errorMessage}" />
          </div>
        {/if}

        <div class="p-3 mt-2 w-4/5 h-fit {creationInProgress ? 'opacity-40 pointer-events-none' : ''}">
          {#if connectionAuditResult && (connectionAuditResult.records?.length || 0) > 0}
            <AuditMessageBox auditResult="{connectionAuditResult}" />
          {/if}
          <form novalidate class="p-2 space-y-7 h-fit" on:submit|preventDefault="{handleOnSubmit}" bind:this="{formEl}">
            {#each configurationKeys as configurationKey}
              <div class="mb-2.5">
                <div class="font-semibold text-xs">
                  {#if configurationKey.description}
                    {configurationKey.description}:
                  {:else if configurationKey.markdownDescription && configurationKey.type !== 'markdown'}
                    <Markdown>{configurationKey.markdownDescription}:</Markdown>
                  {/if}
                  {#if configurationKey.id && configurationValues.has(configurationKey.id)}
                    {getDisplayConfigurationValue(configurationKey, configurationValues.get(configurationKey.id))}
                  {:else}
                    {getDisplayConfigurationValue(configurationKey)}
                  {/if}
                </div>
                <PreferencesRenderingItemFormat
                  invalidRecord="{handleInvalidComponent}"
                  validRecord="{handleValidComponent}"
                  record="{configurationKey}"
                  setRecordValue="{setConfigurationValue}"
                  enableSlider="{true}" />
              </div>
            {/each}
            <div class="w-full">
              <div class="float-right">
                {#if !hideCloseButton}
                  <Button type="link" aria-label="Close page" on:click="{closePage}">Close</Button>
                {/if}
                <Button
                  disabled="{!isValid}"
                  inProgress="{creationInProgress}"
                  on:click="{() => formEl.requestSubmit()}">Create</Button>
              </div>
            </div>
          </form>
        </div>
      {/if}
    </div>
  {/if}
</div>
