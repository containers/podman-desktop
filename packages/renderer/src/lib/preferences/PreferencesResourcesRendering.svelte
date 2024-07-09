<script lang="ts">
import { faArrowUpRightFromSquare, faGear } from '@fortawesome/free-solid-svg-icons';
import type { ContainerProviderConnection } from '@podman-desktop/api';
import { Button, EmptyScreen, Tooltip } from '@podman-desktop/ui-svelte';
import { Buffer } from 'buffer';
import { filesize } from 'filesize';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import Donut from '/@/lib/donut/Donut.svelte';
import { context } from '/@/stores/context';
import { onboardingList } from '/@/stores/onboarding';
import type {
  CheckStatus,
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '/@api/provider-info';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { configurationProperties } from '../../stores/configurationProperties';
import { providerInfos } from '../../stores/providers';
import type { ContextUI } from '../context/context';
import { ContextKeyExpr } from '../context/contextKey';
import { normalizeOnboardingWhenClause } from '../onboarding/onboarding-utils';
import ConnectionErrorInfoButton from '../ui/ConnectionErrorInfoButton.svelte';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import EngineIcon from '../ui/EngineIcon.svelte';
import { PeerProperties } from './PeerProperties';
import { eventCollect } from './preferences-connection-rendering-task';
import PreferencesConnectionActions from './PreferencesConnectionActions.svelte';
import PreferencesConnectionsEmptyRendering from './PreferencesConnectionsEmptyRendering.svelte';
import PreferencesProviderInstallationModal from './PreferencesProviderInstallationModal.svelte';
import PreferencesResourcesRenderingCopyButton from './PreferencesResourcesRenderingCopyButton.svelte';
import SettingsPage from './SettingsPage.svelte';
import {
  getProviderConnectionName,
  type IConnectionRestart,
  type IConnectionStatus,
  type IProviderConnectionConfigurationPropertyRecorded,
  isDefaultScope,
  isPropertyValidInContext,
} from './Util';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
let providers: ProviderInfo[] = [];
$: containerConnectionStatus = new Map<string, IConnectionStatus>();
$: providerInstallationInProgress = new Map<string, boolean>();
$: extensionOnboardingEnablement = new Map<string, string>();

let isStatusUpdated = false;
let displayInstallModal = false;
let providerToBeInstalled: { provider: ProviderInfo; displayName: string } | undefined;
let doExecuteAfterInstallation: () => void;
let preflightChecks: CheckStatus[] = [];

$: preflightChecks = [];

let configurationKeys: IConfigurationPropertyRecordedSchema[];
let restartingQueue: IConnectionRestart[] = [];
let globalContext: ContextUI;

let providersUnsubscribe: Unsubscriber;
let configurationPropertiesUnsubscribe: Unsubscriber;
let onboardingsUnsubscribe: Unsubscriber;
let contextsUnsubscribe: Unsubscriber;

onMount(() => {
  configurationPropertiesUnsubscribe = configurationProperties.subscribe(value => {
    properties = value;
  });

  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    providers = providerInfosValue;
    const connectionNames: string[] = [];
    providers.forEach(provider => {
      if (
        providerToBeInstalled &&
        doExecuteAfterInstallation &&
        provider.name === providerToBeInstalled.provider.name &&
        (provider.status === 'ready' || provider.status === 'installed')
      ) {
        providerToBeInstalled = undefined;
        doExecuteAfterInstallation();
      }

      provider.containerConnections.forEach(container => {
        const containerConnectionName = getProviderConnectionName(provider, container);
        connectionNames.push(containerConnectionName);
        // update the map only if the container state is different from last time
        if (
          !containerConnectionStatus.has(containerConnectionName) ||
          containerConnectionStatus.get(containerConnectionName)?.status !== container.status
        ) {
          isStatusUpdated = true;
          const containerToRestart = getContainerRestarting(provider.internalId, container.name);
          if (containerToRestart) {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: true,
              action: 'restart',
              status: container.status,
            });
            startConnectionProvider(provider, container, containerToRestart.loggerHandlerKey);
          } else {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: false,
              action: undefined,
              status: container.status,
            });
          }
        }
      });
      provider.kubernetesConnections.forEach(connection => {
        const containerConnectionName = getProviderConnectionName(provider, connection);
        connectionNames.push(containerConnectionName);
        // update the map only if the container state is different from last time
        if (
          !containerConnectionStatus.has(containerConnectionName) ||
          containerConnectionStatus.get(containerConnectionName)?.status !== connection.status
        ) {
          isStatusUpdated = true;
          const containerToRestart = getContainerRestarting(provider.internalId, connection.name);
          if (containerToRestart) {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: true,
              action: 'restart',
              status: connection.status,
            });
            startConnectionProvider(provider, connection, containerToRestart.loggerHandlerKey);
          } else {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: false,
              action: undefined,
              status: connection.status,
            });
          }
        }
      });
    });
    // if a machine has been deleted we need to clean its old stored status
    containerConnectionStatus.forEach((v, k) => {
      if (!connectionNames.find(name => name === k)) {
        containerConnectionStatus.delete(k);
      }
    });
    if (isStatusUpdated) {
      isStatusUpdated = false;
      containerConnectionStatus = containerConnectionStatus;
    }
  });

  onboardingsUnsubscribe = onboardingList.subscribe(onboardingItems => {
    extensionOnboardingEnablement = new Map<string, string>();
    onboardingItems.forEach(o => {
      // maybe the boolean value should represent if the onboarding has been completed, to show the setup button or not
      // now true by default
      extensionOnboardingEnablement.set(o.extension, o.enablement);
    });
    extensionOnboardingEnablement = extensionOnboardingEnablement;
  });

  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;
  });
});

function getContainerRestarting(provider: string, container: string): IConnectionRestart {
  const containerToRestart = restartingQueue.filter(c => c.provider === provider && c.container === container)[0];
  if (containerToRestart) {
    restartingQueue = restartingQueue.filter(c => c.provider !== provider && c.container !== container);
  }
  return containerToRestart;
}

onDestroy(() => {
  if (providersUnsubscribe) {
    providersUnsubscribe();
  }
  if (configurationPropertiesUnsubscribe) {
    configurationPropertiesUnsubscribe();
  }
  if (onboardingsUnsubscribe) {
    onboardingsUnsubscribe();
  }
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});

$: configurationKeys = properties
  .filter(property => property.scope === 'ContainerConnection')
  .sort((a, b) => (a?.id ?? '').localeCompare(b?.id ?? ''));

let tmpProviderContainerConfiguration: IProviderConnectionConfigurationPropertyRecorded[] = [];
$: Promise.all(
  providers.map(async provider => {
    const providerContainer = await Promise.all(
      provider.containerConnections.map(async container => {
        return await Promise.all(
          configurationKeys.map(async configurationKey => {
            return {
              ...configurationKey,
              value: configurationKey.id
                ? await window.getConfigurationValue(
                    configurationKey.id,
                    container as unknown as ContainerProviderConnection,
                  )
                : undefined,
              connection: container.name,
              providerId: provider.internalId,
            };
          }),
        );
      }),
    );
    return providerContainer.flat();
  }),
).then(value => (tmpProviderContainerConfiguration = value.flat()));

$: providerContainerConfiguration = tmpProviderContainerConfiguration
  .filter(configurationKey => configurationKey.value !== undefined)
  .reduce((map, value) => {
    const innerProviderContainerConfigurations = map.get(value.providerId) ?? [];
    innerProviderContainerConfigurations.push(value);
    map.set(value.providerId, innerProviderContainerConfigurations);
    return map;
  }, new Map<string, IProviderConnectionConfigurationPropertyRecorded[]>());

function updateContainerStatus(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
  action?: string,
  error?: string,
  inProgress?: boolean,
): void {
  const containerConnectionName = getProviderConnectionName(provider, containerConnectionInfo);
  if (error) {
    const currentStatus = containerConnectionStatus.get(containerConnectionName);
    if (currentStatus) {
      containerConnectionStatus.set(containerConnectionName, {
        ...currentStatus,
        inProgress: false,
        error,
      });
    }
  } else if (action) {
    containerConnectionStatus.set(containerConnectionName, {
      inProgress: inProgress ?? true,
      action: action,
      status: containerConnectionInfo.status,
    });
  }
  containerConnectionStatus = containerConnectionStatus;
}

function addConnectionToRestartingQueue(connection: IConnectionRestart) {
  restartingQueue.push(connection);
}

async function startConnectionProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
  loggerHandlerKey: symbol,
) {
  await window.startProviderConnectionLifecycle(
    provider.internalId,
    containerConnectionInfo,
    loggerHandlerKey,
    eventCollect,
  );
}

async function doCreateNew(provider: ProviderInfo, displayName: string) {
  displayInstallModal = false;
  if (provider.status === 'not-installed') {
    providerInstallationInProgress.set(provider.name, true);
    providerInstallationInProgress = providerInstallationInProgress;
    providerToBeInstalled = { provider, displayName };
    doExecuteAfterInstallation = () => router.goto(`/preferences/provider/${provider.internalId}`);
    performInstallation(provider);
  } else {
    window.telemetryTrack('createNewProviderConnectionPageRequested', {
      providerId: provider.id,
      name: provider.name,
    });
    router.goto(`/preferences/provider/${provider.internalId}`);
  }
}

async function performInstallation(provider: ProviderInfo) {
  const checksStatus: CheckStatus[] = [];
  let checkSuccess = false;
  let currentCheck: CheckStatus;
  try {
    checkSuccess = await window.runInstallPreflightChecks(provider.internalId, {
      endCheck: status => {
        if (currentCheck) {
          currentCheck = status;
        } else {
          return;
        }
        if (currentCheck.successful === false) {
          checksStatus.push(currentCheck);
          preflightChecks = checksStatus;
        }
      },
      startCheck: status => {
        currentCheck = status;
        if (currentCheck.successful === false) {
          preflightChecks = [...checksStatus, currentCheck];
        }
      },
    });
  } catch (err) {
    console.error(err);
  }
  if (checkSuccess) {
    await window.installProvider(provider.internalId);
    // reset checks
    preflightChecks = [];
  } else {
    displayInstallModal = true;
  }
  providerInstallationInProgress.set(provider.name, false);
  providerInstallationInProgress = providerInstallationInProgress;
}

function hideInstallModal() {
  displayInstallModal = false;
}

function isOnboardingEnabled(provider: ProviderInfo, globalContext: ContextUI): boolean {
  let whenEnablement = extensionOnboardingEnablement.get(provider.extensionId);
  if (!whenEnablement) {
    return false;
  }
  whenEnablement = normalizeOnboardingWhenClause(whenEnablement, provider.extensionId);
  const whenDeserialized = ContextKeyExpr.deserialize(whenEnablement);
  const isEnabled = whenDeserialized?.evaluate(globalContext);
  return !!isEnabled;
}

function hasAnyConfiguration(provider: ProviderInfo) {
  return (
    properties
      .filter(
        property =>
          property.parentId.startsWith(`preferences.${provider.extensionId}`) &&
          isDefaultScope(property.scope) &&
          !property.hidden,
      )
      .filter(property => isPropertyValidInContext(property.when, globalContext)).length > 0
  );
}
</script>

<SettingsPage title="Resources">
  <span slot="subtitle" class:hidden="{providers.length === 0}">
    Additional provider information is available under <a
      href="/extensions"
      class="text-gray-700 underline underline-offset-2">Extensions</a>
  </span>
  <div class="h-full" role="region" aria-label="Featured Provider Resources">
    <EmptyScreen
      aria-label="no-resource-panel"
      icon="{EngineIcon}"
      title="No resources found"
      message="Start an extension that manages containers or Kubernetes engines"
      hidden="{providers.length > 0}" />

    {#each providers as provider}
      <div
        class="bg-[var(--pd-invert-content-card-bg)] mb-5 rounded-md p-3 divide-x divide-gray-900 flex"
        role="region"
        aria-label="{provider.id}">
        <div role="region" aria-label="Provider Setup">
          <!-- left col - provider icon/name + "create new" button -->
          <div class="min-w-[170px] max-w-[200px]">
            <div class="flex">
              {#if provider.images.icon}
                {#if typeof provider.images.icon === 'string'}
                  <img src="{provider.images.icon}" alt="{provider.name}" class="max-w-[40px] h-full" />
                  <!-- TODO check theme used for image, now use dark by default -->
                {:else}
                  <img src="{provider.images.icon.dark}" alt="{provider.name}" class="max-w-[40px]" />
                {/if}
              {/if}
              <span class="my-auto font-semibold text-[var(--pd-invert-content-card-header-text)] ml-3 break-words"
                >{provider.name}</span>
            </div>
            <div class="text-center mt-10">
              <!-- Some providers have a status of 'unknown' so that they do not appear in the dashboard, this allows onboarding to still show. -->
              {#if isOnboardingEnabled(provider, globalContext) && (provider.status === 'not-installed' || provider.status === 'unknown')}
                <Button
                  aria-label="Setup {provider.name}"
                  title="Setup {provider.name}"
                  on:click="{() => router.goto(`/preferences/onboarding/${provider.extensionId}`)}">
                  Setup ...
                </Button>
              {:else}
                <div class="flex flex-row justify-around">
                  {#if provider.containerProviderConnectionCreation || provider.kubernetesProviderConnectionCreation}
                    {@const providerDisplayName =
                      (provider.containerProviderConnectionCreation
                        ? provider.containerProviderConnectionCreationDisplayName ?? undefined
                        : provider.kubernetesProviderConnectionCreation
                          ? provider.kubernetesProviderConnectionCreationDisplayName
                          : undefined) ?? provider.name}
                    {@const buttonTitle =
                      (provider.containerProviderConnectionCreation
                        ? provider.containerProviderConnectionCreationButtonTitle ?? undefined
                        : provider.kubernetesProviderConnectionCreation
                          ? provider.kubernetesProviderConnectionCreationButtonTitle
                          : undefined) ?? 'Create new'}
                    <!-- create new provider button -->
                    <Tooltip bottom tip="Create new {providerDisplayName}">
                      <Button
                        aria-label="Create new {providerDisplayName}"
                        inProgress="{providerInstallationInProgress.get(provider.name)}"
                        on:click="{() => doCreateNew(provider, providerDisplayName)}">
                        {buttonTitle} ...
                      </Button>
                    </Tooltip>
                  {/if}
                  {#if isOnboardingEnabled(provider, globalContext) || hasAnyConfiguration(provider)}
                    <Button
                      aria-label="Setup {provider.name}"
                      title="Setup {provider.name}"
                      on:click="{() => {
                        if (isOnboardingEnabled(provider, globalContext)) {
                          router.goto(`/preferences/onboarding/${provider.extensionId}`);
                        } else {
                          router.goto(`/preferences/default/preferences.${provider.extensionId}`);
                        }
                      }}">
                      <Fa size="0.9x" icon="{faGear}" />
                    </Button>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>
        <!-- providers columns -->
        <div
          class="grow flex flex-wrap divide-gray-900 ml-2 text-[var(--pd-invert-content-card-text)]"
          role="region"
          aria-label="Provider Connections">
          <PreferencesConnectionsEmptyRendering
            message="{provider.emptyConnectionMarkdownDescription}"
            hidden="{provider.containerConnections.length > 0 || provider.kubernetesConnections.length > 0}" />
          {#each provider.containerConnections as container}
            {@const peerProperties = new PeerProperties()}
            <div class="px-5 py-2 w-[240px]" role="region" aria-label="{container.name}">
              <div class="float-right">
                <Tooltip bottom tip="{provider.name} details">
                  <button
                    aria-label="{provider.name} details"
                    type="button"
                    on:click="{() =>
                      router.goto(
                        `/preferences/container-connection/view/${provider.internalId}/${Buffer.from(
                          container.name,
                        ).toString('base64')}/${Buffer.from(container.endpoint.socketPath).toString('base64')}/summary`,
                      )}">
                    <Fa icon="{faArrowUpRightFromSquare}" />
                  </button>
                </Tooltip>
              </div>
              <div class="{container.status !== 'started' ? 'text-gray-900' : ''} font-semibold">
                {container.name}
              </div>
              <div class="flex" aria-label="Connection Status">
                <ConnectionStatus status="{container.status}" />
                {#if containerConnectionStatus.has(getProviderConnectionName(provider, container))}
                  {@const status = containerConnectionStatus.get(getProviderConnectionName(provider, container))}
                  <ConnectionErrorInfoButton status="{status}" />
                {/if}
              </div>
              <div class="mt-2 text-gray-700 text-xs" aria-label="{container.name} type">
                {#if container.type === 'docker'}Docker{:else if container.type === 'podman'}Podman{/if} endpoint
              </div>
              <PreferencesResourcesRenderingCopyButton
                class="{container.status !== 'started' ? 'text-gray-900' : ''}"
                path="{container.endpoint.socketPath}" />
              {#if providerContainerConfiguration.has(provider.internalId)}
                {@const providerConfiguration = providerContainerConfiguration.get(provider.internalId) ?? []}
                <div
                  class="flex mt-3 {container.status !== 'started' ? 'text-gray-900' : ''}"
                  role="group"
                  aria-label="Provider Configuration">
                  {#each providerConfiguration.filter(conf => conf.connection === container.name) as connectionSetting}
                    {#if connectionSetting.format === 'cpu' || connectionSetting.format === 'cpuUsage'}
                      {#if !peerProperties.isPeerProperty(connectionSetting.id)}
                        {@const peerValue = peerProperties.getPeerProperty(
                          connectionSetting.id,
                          providerConfiguration.filter(conf => conf.connection === container.name),
                        )}
                        <div class="mr-4">
                          <Donut
                            title="{connectionSetting.description}"
                            value="{connectionSetting.value}"
                            percent="{peerValue}" />
                        </div>
                      {/if}
                    {:else if connectionSetting.format === 'memory' || connectionSetting.format === 'memoryUsage' || connectionSetting.format === 'diskSize' || connectionSetting.format === 'diskSizeUsage'}
                      {#if !peerProperties.isPeerProperty(connectionSetting.id)}
                        {@const peerValue = peerProperties.getPeerProperty(
                          connectionSetting.id,
                          providerConfiguration.filter(conf => conf.connection === container.name),
                        )}
                        <div class="mr-4">
                          <Donut
                            title="{connectionSetting.description}"
                            value="{filesize(connectionSetting.value)}"
                            percent="{peerValue}" />
                        </div>
                      {/if}
                    {:else}
                      {connectionSetting.description}: {connectionSetting.value}
                    {/if}
                  {/each}
                </div>
              {/if}
              <PreferencesConnectionActions
                provider="{provider}"
                connection="{container}"
                connectionStatus="{containerConnectionStatus.get(getProviderConnectionName(provider, container))}"
                updateConnectionStatus="{updateContainerStatus}"
                addConnectionToRestartingQueue="{addConnectionToRestartingQueue}" />
              <div class="mt-1.5 text-gray-900 text-[9px]" aria-label="Connection Version">
                <div>{provider.name} {provider.version ? `v${provider.version}` : ''}</div>
              </div>
            </div>
          {/each}
          {#each provider.kubernetesConnections as kubeConnection}
            <div class="px-5 py-2 w-[240px]" role="region" aria-label="{kubeConnection.name}">
              <div class="float-right">
                <Tooltip bottom tip="{provider.name} details">
                  <button
                    aria-label="{provider.name} details"
                    type="button"
                    on:click="{() =>
                      router.goto(
                        `/preferences/kubernetes-connection/${provider.internalId}/${Buffer.from(
                          kubeConnection.endpoint.apiURL,
                        ).toString('base64')}/summary`,
                      )}">
                    <Fa icon="{faArrowUpRightFromSquare}" />
                  </button>
                </Tooltip>
              </div>
              <div class="font-semibold">
                {kubeConnection.name}
              </div>
              <div class="flex mt-1">
                <ConnectionStatus status="{kubeConnection.status}" />
              </div>
              <div class="mt-2">
                <div class="text-gray-700 text-xs">Kubernetes endpoint</div>
                <div class="mt-1">
                  <span class="my-auto text-xs" class:text-gray-900="{kubeConnection.status !== 'started'}"
                    >{kubeConnection.endpoint.apiURL}</span>
                </div>
              </div>
              <PreferencesConnectionActions
                provider="{provider}"
                connection="{kubeConnection}"
                connectionStatus="{containerConnectionStatus.get(getProviderConnectionName(provider, kubeConnection))}"
                updateConnectionStatus="{updateContainerStatus}"
                addConnectionToRestartingQueue="{addConnectionToRestartingQueue}" />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
  {#if displayInstallModal && providerToBeInstalled}
    <PreferencesProviderInstallationModal
      providerToBeInstalled="{providerToBeInstalled}"
      preflightChecks="{preflightChecks}"
      closeCallback="{hideInstallModal}"
      doCreateNew="{doCreateNew}" />
  {/if}
</SettingsPage>
