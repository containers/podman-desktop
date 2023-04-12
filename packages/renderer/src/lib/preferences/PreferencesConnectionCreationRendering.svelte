<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import PreferencesRenderingItemFormat from './PreferencesRenderingItemFormat.svelte';
import Logger from './Logger.svelte';
import { writeToTerminal } from './Util';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import {
  clearCreateTask,
  type ConnectionCallback,
  disconnectUI,
  eventCollect,
  reconnectUI,
  startTask,
} from './preferences-connection-rendering-task';
import { get } from 'svelte/store';
import { createConnectionsInfo } from '/@/stores/create-connections';
import { onDestroy, onMount } from 'svelte';
import { filesize } from 'filesize';
import { router } from 'tinro';
import LinearProgress from '../ui/LinearProgress.svelte';
import Spinner from '../ui/Spinner.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInfo: ProviderInfo;
export let propertyScope: string;
export let callback: (
  param: string,
  data,
  handlerKey: Symbol,
  collect: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: unknown[]) => void,
  tokenId?: number,
) => Promise<void>;

$: configurationValues = new Map<string, string>();
let creationInProgress = false;
let creationStarted = false;
let creationSuccessful = false;
let creationCancelled = false;
let creationFailed = false;
export let pageIsLoading = true;
let showLogs = false;
let tokenId: number;

let osMemory, osCpu, osFreeDisk;
// get only ContainerProviderConnectionFactory scope fields that are starting by the provider id
let configurationKeys: IConfigurationPropertyRecordedSchema[] = [];

let isValid = true;
let errorMessage = undefined;

$: if (logsTerminal) {
  // reconnect the logger handler
  if (loggerHandlerKey) {
    try {
      reconnectUI(loggerHandlerKey, getLoggerHandler());
    } catch (error) {
      console.error('error while reconnecting', error);
    }
  }
}

onMount(async () => {
  cleanup();
  osMemory = await window.getOsMemory();
  osCpu = await window.getOsCpu();
  osFreeDisk = await window.getOsFreeDiskSize();
  configurationKeys = properties
    .filter(property => property.scope === propertyScope)
    .filter(property => property.id.startsWith(providerInfo.id))
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
  const value = get(createConnectionsInfo);

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
  }
});

onDestroy(() => {
  if (loggerHandlerKey) {
    disconnectUI(loggerHandlerKey);
  }
});

function handleInvalidComponent(_error: string) {
  isValid = false;
}

function handleValidComponent() {
  isValid = true;
}

function setConfigurationValue(id: string, value: string) {
  configurationValues.set(id, value);
  configurationValues = configurationValues;
}

function getDisplayConfigurationValue(configurationKey: IConfigurationPropertyRecordedSchema, value?: any) {
  if (configurationKey.format === 'memory' || configurationKey.format === 'diskSize') {
    return value ? filesize(value) : filesize(configurationKey.default);
  } else if (configurationKey.format === 'cpu') {
    return value ? value : configurationKey.default;
  } else {
    return '';
  }
}

let logsTerminal;
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
  createConnectionsInfo.set({
    createKey: loggerHandlerKey,
    providerInfo,
    properties,
    propertyScope,
    creationInProgress,
    creationSuccessful,
    creationStarted,
    errorMessage,
  });
}

async function handleOnSubmit(e) {
  errorMessage = undefined;
  const formData = new FormData(e.target);

  const data = {};
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
      `Creating a ${providerInfo.name} provider`,
      `/preferences/provider/${providerInfo.internalId}`,
      getLoggerHandler(),
    );
    updateStore();
    await callback(providerInfo.internalId, data, loggerHandlerKey, eventCollect, tokenId);
  } catch (error) {
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

async function cancel() {
  if (tokenId) {
    await window.cancelToken(tokenId);
    creationCancelled = true;
    tokenId = undefined;
  }
}

async function close() {
  cleanup();
}
</script>

<div class="flex flex-1 flex-col">
  {#if creationSuccessful}
    <div class="pf-c-empty-state h-full">
      <div class="pf-c-empty-state__content">
        <i class="fas fa-cubes pf-c-empty-state__icon" aria-hidden="true"></i>
        <h1 class="pf-c-title pf-m-lg">Creation</h1>
        <div class="pf-c-empty-state__body">Successful operation</div>
        <button
          on:click="{() => {
            cleanup();
            router.goto('/preferences/resources');
          }}"
          class="pf-c-button pf-m-primary"
          type="button">
          Go back to resources
        </button>
      </div>
    </div>
  {:else}
    <div class="my-2">
      {#if providerInfo.images && providerInfo.images.icon}
        {#if typeof providerInfo.images.icon === 'string'}
          <img src="{providerInfo.images.icon}" alt="{providerInfo.name}" class="max-h-10" />
          <!-- TODO check theme used for image, now use dark by default -->
        {:else}
          <img src="{providerInfo.images.icon.dark}" alt="{providerInfo.name}" class="max-h-10" />
        {/if}
      {/if}
    </div>
    {@const providerDisplayName =
      (providerInfo.containerProviderConnectionCreation
        ? providerInfo.containerProviderConnectionCreationDisplayName || undefined
        : providerInfo.kubernetesProviderConnectionCreation
        ? providerInfo.kubernetesProviderConnectionCreationDisplayName
        : undefined) || providerInfo.name}
    <h1 class="font-semibold">
      {creationInProgress ? 'Creating' : 'Create a'}
      {providerDisplayName}
      {creationInProgress ? '...' : ''}
    </h1>
    {#if pageIsLoading}
      <div class="text-center mt-16">
        <div role="status">
          <Spinner />
        </div>
      </div>
    {:else}
      {#if creationStarted}
        <div class="w-4/5 mt-2">
          <div class="mt-2 mb-8">
            {#if creationInProgress}
              <LinearProgress />
            {/if}
            <div class="mt-2 float-right">
              <button
                aria-label="Show Logs"
                class="text-xs mr-3 hover:underline"
                on:click="{() => (showLogs = !showLogs)}"
                >Show Logs <i class="fas {showLogs ? 'fa-angle-up' : 'fa-angle-down'}" aria-hidden="true"></i></button>
              <button
                aria-label="Cancel creation"
                class="text-xs {errorMessage ? 'mr-3' : ''} hover:underline {tokenId ? '' : 'hidden'}"
                disabled="{!tokenId}"
                on:click="{cancel}">Cancel</button>
              <button
                class="text-xs hover:underline {creationInProgress ? 'hidden' : ''}"
                aria-label="Close panel"
                on:click="{close}">Close</button>
            </div>
          </div>
          <div id="log" class="pt-2 h-80 {showLogs ? '' : 'hidden'}">
            <div class="w-full h-full">
              <Logger bind:logsTerminal="{logsTerminal}" onInit="{() => {}}" />
            </div>
          </div>
        </div>
      {/if}
      {#if errorMessage}
        <div class="w-4/5 mt-2">
          <ErrorMessage error="{errorMessage}" />
        </div>
      {/if}

      <div class="p-3 mt-4 w-4/5 {creationInProgress ? 'opacity-40 pointer-events-none' : ''}">
        <form novalidate class="pf-c-form p-2" on:submit|preventDefault="{handleOnSubmit}">
          {#each configurationKeys as configurationKey}
            <div class="mb-3">
              <div class="font-semibold text-xs mb-2">
                {configurationKey.description}:
                {#if configurationValues.has(configurationKey.id)}
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
              <button
                class="pf-c-button underline hover:text-gray-400"
                on:click="{() => router.goto('/preferences/resources')}">
                Close
              </button>
              <button disabled="{!isValid || creationInProgress}" class="pf-c-button pf-m-primary" type="submit">
                <div class="mr-24">
                  {#if creationInProgress === true}
                    <i class="pf-c-button__progress">
                      <span class="pf-c-spinner pf-m-md" role="progressbar">
                        <span class="pf-c-spinner__clipper"></span>
                        <span class="pf-c-spinner__lead-ball"></span>
                        <span class="pf-c-spinner__tail-ball"></span>
                      </span>
                    </i>
                  {/if}
                </div>
                Create
              </button>
            </div>
          </div>
        </form>
      </div>
    {/if}
  {/if}
</div>
