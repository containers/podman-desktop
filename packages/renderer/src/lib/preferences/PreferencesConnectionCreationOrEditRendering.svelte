<script lang="ts">
import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import type { AuditRequestItems, AuditResult, ConfigurationScope } from '@desktop-framework/extension-api';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow, EmptyScreen, ErrorMessage, Spinner } from '@podman-desktop/ui-svelte';
import type { Terminal } from '@xterm/xterm';
import { onDestroy, onMount } from 'svelte';
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { get, type Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import type { ContextUI } from '/@/lib/context/context';
import Markdown from '/@/lib/markdown/Markdown.svelte';
import AuditMessageBox from '/@/lib/ui/AuditMessageBox.svelte';
import TerminalWindow from '/@/lib/ui/TerminalWindow.svelte';
import { context } from '/@/stores/context';
/* eslint-enable import/no-duplicates */
import { operationConnectionsInfo } from '/@/stores/operation-connections';

import EditableConnectionResourceItem from './item-formats/EditableConnectionResourceItem.svelte';
import {
  clearCreateTask,
  type ConnectionCallback,
  disconnectUI,
  eventCollect,
  reconnectUI,
  registerConnectionCallback,
} from './preferences-connection-rendering-task';
import PreferencesRenderingItemFormat from './PreferencesRenderingItemFormat.svelte';
import { calcHalfCpuCores, getInitialValue, isPropertyValidInContext, writeToTerminal } from './Util';

interface Props {
  properties: IConfigurationPropertyRecordedSchema[];
  providerInfo: ProviderInfo;
  propertyScope: string;
  callback(
    param: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    handlerKey: symbol,
    collect: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void,
    tokenId: number | undefined,
    taskId: number | undefined,
  ): Promise<void>;
  taskId?: number;
  disableEmptyScreen?: boolean;
  hideCloseButton?: boolean;
  connectionInfo?: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo;
  inProgress?: boolean;
  pageIsLoading?: boolean;
}

let {
  properties = [],
  providerInfo,
  propertyScope,
  callback,
  taskId = undefined,
  disableEmptyScreen = false,
  hideCloseButton = false,
  connectionInfo = undefined,
  inProgress = $bindable(false),
  pageIsLoading = true,
}: Props = $props();

let configurationValues = $state(new Map<string, { modified: boolean; value: string | boolean | number }>());
let operationStarted = $state(false);
let operationSuccessful = $state(false);
let operationCancelled = $state(false);
let showLogs = $state(false);
let tokenId: number | undefined = $state();
// get only ContainerProviderConnectionFactory scope fields that are starting by the provider id
let configurationKeys: IConfigurationPropertyRecordedSchema[] = $state([]);
let isValid = $state(true);
let errorMessage: string | undefined = $state();
let formEl: HTMLFormElement | undefined = $state();
let connectionAuditResult: AuditResult | undefined = $state();
let logsTerminal: Terminal | undefined = $state();

let existingFormData: { [key: string]: unknown } | undefined;
let operationFailed = false;
let osMemory: string;
let osCpu: string;
let osFreeDisk: string;
let globalContext: ContextUI;
let contextsUnsubscribe: Unsubscriber;
const buttonLabel = connectionInfo ? 'Update' : 'Create';
const operationLabel = connectionInfo ? 'Update' : 'Creation';
let loggerHandlerKey: symbol | undefined = undefined;
let reconnectedUI: boolean = false;

// reconnect the logger handler
$effect(() => {
  if (!reconnectedUI && logsTerminal && loggerHandlerKey) {
    try {
      reconnectUI(loggerHandlerKey, getLoggerHandler());
    } catch (error) {
      console.error('error while reconnecting', error);
    } finally {
      reconnectedUI = true;
    }
  }
});

onMount(async () => {
  osMemory = await window.getOsMemory();
  osCpu = await window.getOsCpu();
  osFreeDisk = await window.getOsFreeDiskSize();
  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;
    loadConnectionParams().catch(() => console.error('unable to reload connection params'));
  });

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
      existingFormData = value.formData;
    }
    restoreConfigurationValues();
  }

  taskId ??= operationConnectionInfoMap.size + 1;

  const data: { [p: string]: unknown } = {};
  for (let field of configurationKeys) {
    const id = field.id;
    if (id) {
      data[id] = field.default;
    }
  }
  if (!connectionInfo) {
    try {
      connectionAuditResult = await window.auditConnectionParameters(providerInfo.internalId, data);
    } catch (e: unknown) {
      console.warn(e && typeof e === 'object' && 'message' in e ? e.message : e);
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

async function loadConnectionParams(): Promise<void> {
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
}

function handleInvalidComponent(): void {
  isValid = false;
}

async function handleValidComponent(): Promise<void> {
  isValid = true;

  // it can happen (at least in tests) that some fields are not set yet (NumberItem will wait 500ms before to change value)
  if (!formEl) {
    return;
  }
  const formData = new FormData(formEl);

  const data: { [key: string]: FormDataEntryValue } = {};
  for (let field of formData) {
    let [key, value] = field;
    // formData does not always contain the latest data selected/entered by the user (see https://github.com/podman-desktop/podman-desktop/issues/9767)
    // However, as this function "handleValidComponent" is called from inside the PreferencesRenderingItemFormat component just after the configurationValues is updated
    // we can be sure to audit the correct data by retrieving the value from there by using the key from the formData
    if (configurationValues.has(key)) {
      const configValueByKey = configurationValues.get(key);
      if (configValueByKey) {
        value = configValueByKey.value.toString();
      }
    }
    data[key] = value;
  }

  try {
    const auditResult = await window.auditConnectionParameters(providerInfo.internalId, data as AuditRequestItems);
    isValid = auditResult.records.filter(record => record.type === 'error').length === 0;
    connectionAuditResult = auditResult;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.warn(err.message);
    } else {
      console.warn(String(err));
    }
  }
}

function internalSetConfigurationValue(id: string, modified: boolean, value: string | boolean | number): void {
  const item = configurationValues.get(id);
  if (item) {
    // if the value has already been modified by the user and this is not an explicit user modification we do not update the value
    // it may happen that the UI refreshes for some reason (like a value chosen in a dropdownlist) and we do not have to reset the
    // values already entered (modified = true) by the user
    if (modified || !item.modified) {
      item.modified = modified;
      item.value = value;
    }
  } else {
    configurationValues.set(id, { modified, value });
  }
  configurationValues = $state.snapshot(configurationValues);
}

function setConfigurationValue(id: string, value: string | boolean | number): void {
  internalSetConfigurationValue(id, true, value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

function restoreConfigurationValues(): void {
  if (!existingFormData) {
    return;
  }
  for (let dataItem in existingFormData) {
    const configurationKey = configurationKeys.find(configKey => configKey.id === dataItem);
    if (
      configurationKey?.type === 'number' &&
      typeof existingFormData[dataItem] === 'string' &&
      !isNaN(parseFloat(existingFormData[dataItem]))
    ) {
      existingFormData[dataItem] = parseFloat(existingFormData[dataItem]);
    }
    if (
      typeof existingFormData[dataItem] === 'number' ||
      typeof existingFormData[dataItem] === 'string' ||
      typeof existingFormData[dataItem] === 'boolean'
    ) {
      configurationValues.set(dataItem, { modified: true, value: existingFormData[dataItem] });
    }
  }
}

function getLoggerHandler(): ConnectionCallback {
  return {
    log: (args): void => {
      if (logsTerminal) writeToTerminal(logsTerminal, args, '\x1b[37m');
    },
    warn: (args): void => {
      if (logsTerminal) writeToTerminal(logsTerminal, args, '\x1b[33m');
    },
    error: (args): void => {
      operationFailed = true;
      if (logsTerminal) writeToTerminal(logsTerminal, args, '\x1b[1;31m');
    },
    onEnd: (): void => {
      ended().catch((err: unknown) => console.error('Error closing terminal', err));
    },
  };
}

async function ended(): Promise<void> {
  inProgress = false;
  tokenId = undefined;
  if (!operationCancelled && !operationFailed) {
    window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
    operationSuccessful = true;
  }
  updateStore();
}

async function cleanup(): Promise<void> {
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
function updateStore(): void {
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
        formData: existingFormData,
      });
    }
    return map;
  });
}

async function handleOnSubmit(e: SubmitEvent): Promise<void> {
  errorMessage = undefined;
  if (e.target instanceof HTMLFormElement) {
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
    existingFormData = data;

    try {
      tokenId = await window.getCancellableTokenSource();
      // clear terminal
      logsTerminal?.clear();
      loggerHandlerKey = registerConnectionCallback(getLoggerHandler());
      updateStore();
      await callback(providerInfo.internalId, data, loggerHandlerKey, eventCollect, tokenId, taskId);
    } catch (error: unknown) {
      //display error
      tokenId = undefined;
      // filter cancellation message to avoid displaying error and allow user to restart the creation
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        error.message &&
        typeof error.message === 'string' &&
        error.message.indexOf('Execution cancelled') >= 0
      ) {
        errorMessage = 'Action cancelled. See logs for more details';
        return;
      }
      errorMessage = String(error);
      operationStarted = false;
      inProgress = false;
    }
  }
}

async function cancelCreation(): Promise<void> {
  if (tokenId) {
    await window.cancelToken(tokenId);
    operationCancelled = true;
    tokenId = undefined;
  }
  await window.telemetryTrack(
    connectionInfo ? 'updateProviderConnectionRequestUserCanceled' : 'createNewProviderConnectionRequestUserCanceled',
    {
      providerId: providerInfo.id,
      name: providerInfo.name,
    },
  );
}

async function closePanel(): Promise<void> {
  await cleanup();
}

async function closePage(): Promise<void> {
  router.goto('/preferences/resources');
  await window.telemetryTrack(
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
): string | boolean | number | undefined {
  if (configurationKey.id && configurationValues.has(configurationKey.id)) {
    const value = configurationValues.get(configurationKey.id);
    if (value?.value !== undefined) {
      return value.value;
    }
  }
  return undefined;
}

function getConnectionResourceConfigurationNumberValue(
  configurationKey: IConfigurationPropertyRecordedSchema,
  configurationValues: Map<string, { modified: boolean; value: string | boolean | number }>,
): number | undefined {
  const value = getConnectionResourceConfigurationValue(configurationKey, configurationValues);
  if (typeof value === 'number') {
    return value;
  }
  return undefined;
}

function preventDefault(handler: (e: SubmitEvent) => Promise<void>): (e: SubmitEvent) => Promise<void> {
  return async (e: SubmitEvent) => {
    e.preventDefault();
    await handler(e);
  };
}
</script>

<div class="flex flex-col w-full h-full overflow-hidden">
  {#if operationSuccessful && !disableEmptyScreen}
    <EmptyScreen icon={faCubes} title={operationLabel} message="Successful operation">
      <Button
        class="py-3"
        on:click={async (): Promise<void> => {
          await cleanup();
          router.goto('/preferences/resources');
        }}>
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
          <div class="w-full">
            <div class="mt-2 mb-8">
              <div class="mt-2 float-right">
                <button
                  aria-label="Show Logs"
                  class="text-xs mr-3 hover:underline"
                  onclick={(): boolean => (showLogs = !showLogs)}
                  >Show Logs <i class="fas {showLogs ? 'fa-angle-up' : 'fa-angle-down'}" aria-hidden="true"></i
                  ></button>
                <button
                  aria-label="Cancel {operationLabel.toLowerCase()}"
                  class="text-xs {errorMessage ? 'mr-3' : ''} hover:underline {tokenId ? '' : 'hidden'}"
                  disabled={!tokenId}
                  onclick={cancelCreation}>Cancel</button>
                <button
                  class="text-xs hover:underline {inProgress ? 'hidden' : ''}"
                  aria-label="Close panel"
                  onclick={closePanel}>Close</button>
              </div>
            </div>
            <div id="log" class="pt-2 h-80 {showLogs ? '' : 'hidden'}">
              <div class="w-full h-full">
                <TerminalWindow bind:terminal={logsTerminal} />
              </div>
            </div>
          </div>
        {/if}
        {#if errorMessage}
          <div class="pt-3 mt-2 w-full h-fit">
            <ErrorMessage error={errorMessage} />
          </div>
        {/if}

        <div class="p-3 mt-2 w-full h-fit {inProgress ? 'opacity-40 pointer-events-none' : ''}">
          {#if connectionAuditResult && (connectionAuditResult.records?.length ?? 0) > 0}
            <AuditMessageBox auditResult={connectionAuditResult} />
          {/if}
          <form
            novalidate
            class="p-2 space-y-7 h-fit"
            onsubmit={preventDefault(handleOnSubmit)}
            bind:this={formEl}
            aria-label="Properties Information">
            {#each configurationKeys as configurationKey (configurationKey.id)}
              <div class="mb-2.5">
                <div class="flex flex-row items-center h-fit">
                  {#if configurationKey.description}
                    {configurationKey.description}:
                  {:else if configurationKey.markdownDescription && configurationKey.type !== 'markdown'}
                    <Markdown markdown={configurationKey.markdownDescription} />
                  {/if}
                  {#if configurationKey.format === 'memory' || configurationKey.format === 'diskSize' || configurationKey.format === 'cpu'}
                    <div class="text-[var(--pd-content-text)]">
                      <EditableConnectionResourceItem
                        record={configurationKey}
                        value={getConnectionResourceConfigurationNumberValue(configurationKey, configurationValues)}
                        onSave={setConfigurationValue} />
                    </div>
                  {/if}
                </div>
                {#if configurationValues}
                  <PreferencesRenderingItemFormat
                    invalidRecord={handleInvalidComponent}
                    validRecord={handleValidComponent}
                    record={configurationKey}
                    setRecordValue={setConfigurationValue}
                    enableSlider={true}
                    initialValue={getConfigurationValue(configurationKey)}
                    givenValue={getConnectionResourceConfigurationValue(configurationKey, configurationValues)} />
                {/if}
              </div>
            {/each}
            <div class="w-full">
              <ButtonRow>
                {#if !hideCloseButton}
                  <Button type="link" aria-label="Close page" on:click={closePage}>Close</Button>
                {/if}
                <Button disabled={!isValid} inProgress={inProgress} on:click={(): void => formEl?.requestSubmit()}
                  >{buttonLabel}</Button>
              </ButtonRow>
            </div>
          </form>
        </div>
      {/if}
    </div>
  {/if}
</div>
