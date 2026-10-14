<script lang="ts">
import type { CheckStatus, Menu, ProviderConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import { MenuContext } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import type { ContainerProviderConnection } from '@desktop-framework/extension-api';
import { faCircleInfo, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenu, EmptyScreen, Tooltip } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { Buffer } from 'buffer';
import { onDestroy, onMount } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import ContributionActions from '/@/lib/actions/ContributionActions.svelte';
import type { ContextUI } from '/@/lib/context/context';
import { ContextKeyExpr } from '/@/lib/context/contextKey';
import Donut from '/@/lib/donut/Donut.svelte';
import ActionsMenu from '/@/lib/image/ActionsMenu.svelte';
import { normalizeOnboardingWhenClause } from '/@/lib/onboarding/onboarding-utils';
import BooleanEnumDisplay from '/@/lib/ui/BooleanEnumDisplay.svelte';
import ConnectionErrorIndicator from '/@/lib/ui/ConnectionErrorIndicator.svelte';
import ConnectionErrorInfoButton from '/@/lib/ui/ConnectionErrorInfoButton.svelte';
import ConnectionStatus from '/@/lib/ui/ConnectionStatus.svelte';
import EngineIcon from '/@/lib/ui/EngineIcon.svelte';
import { capitalize } from '/@/lib/ui/Util';
import { configurationProperties } from '/@/stores/configurationProperties';
import { context } from '/@/stores/context';
import { onboardingList } from '/@/stores/onboarding';
import { providerInfos } from '/@/stores/providers';

import {
  type ConnectionResourceMetricDisplay,
  extractConnectionResourceMetrics,
  RESOURCE_FORMATS,
  toDisplayMetrics,
} from './connection-resource-metrics';
import { eventCollect } from './preferences-connection-rendering-task';
import PreferencesConnectionActions from './PreferencesConnectionActions.svelte';
import PreferencesConnectionsEmptyRendering from './PreferencesConnectionsEmptyRendering.svelte';
import PreferencesManagedInput from './PreferencesManagedInput.svelte';
import PreferencesProviderInstallationModal from './PreferencesProviderInstallationModal.svelte';
import PreferencesResourcesRenderingCopyButton from './PreferencesResourcesRenderingCopyButton.svelte';
import ProviderActionButtons from './ProviderActionButtons.svelte';
import SettingsPage from './SettingsPage.svelte';
import {
  getProviderConnectionName,
  type IConnectionRestart,
  type IConnectionStatus,
  type IProviderConnectionConfigurationPropertyRecorded,
  isDefaultScope,
  isPropertyValidInContext,
} from './Util';

let providers = $state<ProviderInfo[]>([]);
let containerConnectionStatus = new SvelteMap<string, IConnectionStatus>();
let providerInstallationInProgress = new SvelteMap<string, boolean>();
let extensionOnboardingEnablement = new SvelteMap<string, string>();
let displayInstallModal = $state(false);
let providerToBeInstalled = $state<{ provider: ProviderInfo; displayName: string }>();
let doExecuteAfterInstallation: () => void;
let preflightChecks = $state<CheckStatus[]>([]);

let restartingQueue: IConnectionRestart[] = [];
let globalContext = $state<ContextUI>();

let providersUnsubscribe: Unsubscriber;
let configurationPropertiesUnsubscribe: Unsubscriber;
let onboardingsUnsubscribe: Unsubscriber;
let contextsUnsubscribe: Unsubscriber;

let contributionsContainerConnection = $state<Menu[]>([]);
let contributionsProvider = $state<Menu[]>([]);

onMount(async () => {
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
          const containerToRestart = getContainerRestarting(provider.internalId, container.name);
          if (containerToRestart) {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: true,
              action: 'restart',
              status: container.status,
            });
            startConnectionProvider(provider, container, containerToRestart.loggerHandlerKey).catch((err: unknown) =>
              console.error(`Error starting connection provider ${container.name}`, err),
            );
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
          const containerToRestart = getContainerRestarting(provider.internalId, connection.name);
          if (containerToRestart) {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: true,
              action: 'restart',
              status: connection.status,
            });
            startConnectionProvider(provider, connection, containerToRestart.loggerHandlerKey).catch((err: unknown) =>
              console.error(`Error starting connection provider ${connection.name}`, err),
            );
          } else {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: false,
              action: undefined,
              status: connection.status,
            });
          }
        }
      });
      provider.vmConnections.forEach(connection => {
        const vmConnectionName = getProviderConnectionName(provider, connection);
        connectionNames.push(vmConnectionName);
        // update the map only if the container state is different from last time
        if (
          !containerConnectionStatus.has(vmConnectionName) ||
          containerConnectionStatus.get(vmConnectionName)?.status !== connection.status
        ) {
          const containerToRestart = getContainerRestarting(provider.internalId, connection.name);
          if (containerToRestart) {
            containerConnectionStatus.set(vmConnectionName, {
              inProgress: true,
              action: 'restart',
              status: connection.status,
            });
            startConnectionProvider(provider, connection, containerToRestart.loggerHandlerKey).catch((err: unknown) =>
              console.error(`Error starting connection provider ${connection.name}`, err),
            );
          } else {
            containerConnectionStatus.set(vmConnectionName, {
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
  });

  onboardingsUnsubscribe = onboardingList.subscribe(onboardingItems => {
    extensionOnboardingEnablement = new SvelteMap<string, string>();
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

  contributionsContainerConnection = await window.getContributedMenus(MenuContext.DASHBOARD_CONTAINER_CONNECTION);
  contributionsProvider = await window.getContributedMenus(MenuContext.DASHBOARD_PROVIDER);
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

function updateContainerStatus(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderConnectionInfo,
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
}

function addConnectionToRestartingQueue(connection: IConnectionRestart): void {
  restartingQueue.push(connection);
}

async function startConnectionProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderConnectionInfo,
  loggerHandlerKey: symbol,
): Promise<void> {
  await window.startProviderConnectionLifecycle(
    provider.internalId,
    $state.snapshot(containerConnectionInfo),
    loggerHandlerKey,
    eventCollect,
  );
}

async function doCreateNew(provider: ProviderInfo, displayName: string): Promise<void> {
  displayInstallModal = false;
  if (provider.status === 'not-installed') {
    providerInstallationInProgress.set(provider.name, true);
    providerToBeInstalled = { provider, displayName };
    doExecuteAfterInstallation = (): void => router.goto(`/preferences/resources/provider/${provider.internalId}`);
    await performInstallation(provider);
  } else {
    await window.telemetryTrack('createNewProviderConnectionPageRequested', {
      providerId: provider.id,
      name: provider.name,
    });
    router.goto(`/preferences/resources/provider/${provider.internalId}`);
  }
}

async function performInstallation(provider: ProviderInfo): Promise<void> {
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
}

function hideInstallModal(): void {
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

function hasAnyConfiguration(provider: ProviderInfo): boolean {
  return (
    properties
      .filter(
        property =>
          property.parentId.startsWith(`preferences.${provider.extensionId}`) &&
          isDefaultScope(property.scope) &&
          !property.hidden,
      )
      .filter(property => globalContext && isPropertyValidInContext(property.when, globalContext)).length > 0
  );
}

// Goes through the provider to see if there are any properties which are "locked" and provide a simple true/false
// this helps us determine if we should have a UI indicator if there is anything locked or not
function hasLockedConfiguration(provider: ProviderInfo): boolean {
  return properties.some(property => property.locked === true && property.extension?.id === provider.extensionId);
}

function handleUpdatePreflightChecks(checks: CheckStatus[]): CheckStatus[] {
  preflightChecks = checks;
  return checks;
}

interface Props {
  properties?: IConfigurationPropertyRecordedSchema[];
  focus: string | undefined;
}

function getRootfulDisplayInfo(
  provider: ProviderInfo,
  container: ProviderConnectionInfo,
): IProviderConnectionConfigurationPropertyRecorded | undefined {
  if (!providerContainerConfiguration.has(provider.internalId)) {
    return undefined;
  }

  const providerConfiguration = providerContainerConfiguration.get(provider.internalId) ?? [];
  const rootfulSetting = providerConfiguration.find(
    conf => conf.connection === container.name && conf.id === 'podman.machine.rootful',
  );

  return rootfulSetting;
}

function getConnectionResourceData(
  provider: ProviderInfo,
  container: ProviderConnectionInfo,
):
  | {
      displayMetrics: ConnectionResourceMetricDisplay[];
      nonResourceConfigs: IProviderConnectionConfigurationPropertyRecorded[];
    }
  | undefined {
  if (!providerContainerConfiguration.has(provider.internalId)) {
    return undefined;
  }
  const connectionConfigs = (providerContainerConfiguration.get(provider.internalId) ?? []).filter(
    conf => conf.connection === container.name,
  );
  const resourceMetrics = extractConnectionResourceMetrics(connectionConfigs);
  const displayMetrics = resourceMetrics ? toDisplayMetrics(resourceMetrics) : [];
  const nonResourceConfigs = connectionConfigs.filter(conf => !RESOURCE_FORMATS.has(conf.format ?? '') && !conf.hidden);
  return { displayMetrics, nonResourceConfigs };
}

let { properties = [], focus }: Props = $props();
let providerElementMap = $state<Record<string, HTMLElement>>({});

function handleError(errorMessage: string): void {
  console.error(errorMessage);
}

let configurationKeys: IConfigurationPropertyRecordedSchema[] = $derived(
  properties
    .filter(property => property.scope === 'ContainerConnection')
    .toSorted((a, b) => (a?.id ?? '').localeCompare(b?.id ?? '')),
);

let tmpProviderContainerConfiguration = $state<IProviderConnectionConfigurationPropertyRecorded[]>([]);
function updateTmpProviderContainerConfiguration(value: IProviderConnectionConfigurationPropertyRecorded[]): void {
  tmpProviderContainerConfiguration = value;
}

$effect(() => {
  Promise.all(
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
                      $state.snapshot(container) as unknown as ContainerProviderConnection,
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
  )
    .then(value => updateTmpProviderContainerConfiguration(value.flat()))
    .catch((err: unknown) => console.error('Error collecting providers', err));
});
let providerContainerConfiguration = $derived(
  tmpProviderContainerConfiguration
    .filter(configurationKey => configurationKey.value !== undefined)
    .reduce((map, value) => {
      const innerProviderContainerConfigurations = map.get(value.providerId) ?? [];
      innerProviderContainerConfigurations.push(value);
      map.set(value.providerId, innerProviderContainerConfigurations);
      return map;
    }, new Map<string, IProviderConnectionConfigurationPropertyRecorded[]>()),
);
$effect(() => {
  if (focus && providerElementMap[focus]) {
    providerElementMap[focus].scrollIntoView({ behavior: 'auto', block: 'start' });
  }
});
</script>

<SettingsPage title="Resources">
  {#snippet subtitle()}
    <span  class:hidden={providers.length === 0}>
      Additional provider information is available under <a
        href="/extensions"
        class="text-[var(--pd-content-text)] underline underline-offset-2">Extensions</a>
    </span>
  {/snippet}
  <div role="region" aria-label="Featured Provider Resources">
    <EmptyScreen
      aria-label="no-resource-panel"
      icon={EngineIcon}
      title="No resources found"
      message="Start an extension that manages containers or Kubernetes engines"
      hidden={providers.length > 0} />

    {#each providers as provider (provider.id)}
      <div
        id={provider.id}
        bind:this={providerElementMap[provider.id]}
        class="bg-[var(--pd-invert-content-card-bg)] mb-5 rounded-md p-3 flex"
        role="region"
        aria-label={provider.id}>
        <div role="region" aria-label="Provider Setup" class="border-r border-[var(--pd-content-divider)] flex flex-col">
          <!-- left col - provider icon/name + "create new" button -->
          <div class="min-w-[170px] max-w-[200px] pr-5 py-2 flex flex-col flex-1">
            <div class="flex">
              {#if provider.images.icon}
                <Icon icon={provider.images.icon} title={provider.name} class="max-w-[40px]" />
              {/if}
              <span class="my-auto font-semibold text-[var(--pd-invert-content-card-header-text)] ml-3 break-words"
                >{provider.name}</span>
              {#if provider.version}
                <span class="my-auto text-[var(--pd-content-sub-header)] ml-3 break-words"
                  >v{provider.version}</span>
              {/if}
            </div>
            <ProviderActionButtons
              provider={provider}
              contributions={contributionsProvider}
              globalContext={globalContext}
              providerInstallationInProgress={providerInstallationInProgress.get(provider.name) ?? false}
              onCreateNew={doCreateNew}
              onUpdatePreflightChecks={handleUpdatePreflightChecks}
              isOnboardingEnabled={isOnboardingEnabled}
              hasAnyConfiguration={hasAnyConfiguration} />
            {#if hasLockedConfiguration(provider)}
              <div class="mt-auto text-(--pd-content-text)">
                <PreferencesManagedInput />
              </div>
            {/if}
          </div>
        </div>
        <!-- providers columns -->
        <div
          class="grow flex flex-wrap text-[var(--pd-invert-content-card-text)]"
          role="region"
          aria-label="Provider Connections">
          <PreferencesConnectionsEmptyRendering
            message={provider.emptyConnectionMarkdownDescription}
            hidden={provider.containerConnections.length > 0 || provider.kubernetesConnections.length > 0 || provider.vmConnections.length > 0} />
          {#each provider.containerConnections as container, index (index)}
            {@const rootfulInfo = getRootfulDisplayInfo(provider, container)}
            <div class="px-5 py-2 w-[240px] border-r border-[var(--pd-content-divider)]" role="region" aria-label={container.name}>
              <div class="float-right">
                <Tooltip bottom tip="{provider.name} details">
                  <button
                    aria-label="{provider.name} details"
                    type="button"
                    onclick={(): void =>
                      router.goto(
                        `/preferences/container-connection/view/${provider.internalId}/${Buffer.from(
                          container.name,
                        ).toString('base64')}/${Buffer.from(container.endpoint.socketPath).toString('base64')}/summary`,
                      )}>
                    <Icon icon={faCircleInfo} />
                  </button>
                </Tooltip>
              </div>
              <div class="{container.status !== 'started' ? 'text-[var(--pd-content-sub-header)]' : ''} font-semibold">
                {container.displayName}
                {#if rootfulInfo}
                  <span class="ml-2 text-sm text-[var(--pd-content-sub-header)]">
                    (<BooleanEnumDisplay
                      value={rootfulInfo.value}
                      options={rootfulInfo.enum ?? []}
                      ariaLabel="{rootfulInfo.description}: {rootfulInfo.value}" />)
                  </span>
                {/if}
              </div>
              <div class="flex" aria-label="Connection Status">
                <ConnectionStatus status={container.status} />
                <ConnectionErrorIndicator error={container.error} />
                {#if containerConnectionStatus.has(getProviderConnectionName(provider, container))}
                  {@const status = containerConnectionStatus.get(getProviderConnectionName(provider, container))}
                  <ConnectionErrorInfoButton status={status} />
                {/if}
              </div>
              <div class="mt-2 text-[var(--pd-content-text)] text-xs" aria-label="{container.name} type">
                {#if container.type === 'docker'}Docker{:else if container.type === 'podman'}Podman{/if} endpoint
              </div>
              <PreferencesResourcesRenderingCopyButton
                class={container.status !== 'started' ? 'text-[var(--pd-content-sub-header)]' : ''}
                path={container.endpoint.socketPath} />
              {#if providerContainerConfiguration.has(provider.internalId)}
                {@const { displayMetrics, nonResourceConfigs } = getConnectionResourceData(provider, container)!}
                <div
                  class="flex mt-3 {container.status !== 'started' ? 'text-[var(--pd-content-sub-header)]' : ''}"
                  role="group"
                  aria-label="Provider Configuration">
                  {#each displayMetrics as metric (metric.title)}
                    <Donut title={metric.title} value={metric.value} percent={metric.percent} />
                  {/each}
                  {#each nonResourceConfigs as connectionSetting (connectionSetting.id)}
                    {connectionSetting.description}: {connectionSetting.value}
                  {/each}
                </div>
              {/if}
              <PreferencesConnectionActions
                provider={provider}
                connection={container}
                connectionStatus={containerConnectionStatus.get(getProviderConnectionName(provider, container))}
                updateConnectionStatus={updateContainerStatus}
                addConnectionToRestartingQueue={addConnectionToRestartingQueue}>
                {#snippet advanced_actions()}
                  <span  class:hidden={providers.length === 0}>
                    <Tooltip bottom tip="More Options">
                      <ActionsMenu
                        dropdownMenu={true}
                        onBeforeToggle={(): void => {
                          globalContext?.setValue('selectedProviderConnectionType', container.type);
                          globalContext?.setValue('selectedProviderConnectionStatus', container.status);
                      }}>
                        <DropdownMenu.Item title="Open Terminal" icon={faTerminal} onClick={(): void => {router.goto(
                          `/preferences/container-connection/view/${provider.internalId}/${Buffer.from(
                            container.name,
                          ).toString('base64')}/${Buffer.from(container.endpoint.socketPath).toString('base64')}/terminal`);}}/>
                        <ContributionActions
                          args={[container]}
                          contextPrefix="providerConnectionItem"
                          dropdownMenu={true}
                          contributions={contributionsContainerConnection}
                          detailed={false}
                          onError={handleError} />
                      </ActionsMenu>
                    </Tooltip>
                  </span>
                {/snippet}
              </PreferencesConnectionActions>
              <div class="mt-1.5 text-[var(--pd-content-sub-header)] text-[9px] flex justify-between">
                <div aria-label="Connection Type">{container.vmType ? capitalize(container.vmType.name) : ''}</div>
              </div>
            </div>
          {/each}
          {#each provider.kubernetesConnections as kubeConnection, index (index)}
            <div class="px-5 py-2 w-[240px] border-r border-[var(--pd-content-divider)]" role="region" aria-label={kubeConnection.name}>
              <div class="float-right">
                <Tooltip bottom tip="{provider.name} details">
                  <button
                    aria-label="{provider.name} details"
                    type="button"
                    onclick={(): void =>
                      router.goto(
                        `/preferences/kubernetes-connection/${provider.internalId}/${Buffer.from(
                          kubeConnection.endpoint.apiURL,
                        ).toString('base64')}/summary`,
                      )}>
                    <Icon icon={faCircleInfo} />
                  </button>
                </Tooltip>
              </div>
              <div class="font-semibold">
                {kubeConnection.name}
              </div>
              <div class="flex mt-1" aria-label="Connection Status">
                <ConnectionStatus status={kubeConnection.status} />
                <ConnectionErrorIndicator error={kubeConnection.error} />
              </div>
              <div class="mt-2">
                <div class="text-[var(--pd-content-text)] text-xs">Kubernetes endpoint</div>
                <div class="mt-1">
                  <span class="my-auto text-xs" class:text-[var(--pd-content-sub-header)]={kubeConnection.status !== 'started'}
                    >{kubeConnection.endpoint.apiURL}</span>
                </div>
              </div>
              <PreferencesConnectionActions
                provider={provider}
                connection={kubeConnection}
                connectionStatus={containerConnectionStatus.get(getProviderConnectionName(provider, kubeConnection))}
                updateConnectionStatus={updateContainerStatus}
                addConnectionToRestartingQueue={addConnectionToRestartingQueue} />
            </div>
          {/each}
          {#each provider.vmConnections as vmConnection, index (index)}
          <div class="px-5 py-2 w-[240px] border-r border-[var(--pd-content-divider)]" role="region" aria-label={vmConnection.name}>
            <div class="float-right">
              <Tooltip bottom tip="{provider.name} details">
                <button
                  aria-label="{provider.name} details"
                  type="button"
                  onclick={(): void =>
                    router.goto(
                      `/preferences/vm-connection/${provider.internalId}/${vmConnection.name}/terminal`,
                    )}>
                  <Icon icon={faCircleInfo} />
                </button>
              </Tooltip>
            </div>
            <div class="font-semibold">
              {vmConnection.name}
            </div>
            <div class="flex mt-1" aria-label="Connection Status">
              <ConnectionStatus status={vmConnection.status} />
              <ConnectionErrorIndicator error={vmConnection.error} />
              {#if containerConnectionStatus.has(getProviderConnectionName(provider, vmConnection))}
                {@const status = containerConnectionStatus.get(getProviderConnectionName(provider, vmConnection))}
                <ConnectionErrorInfoButton status={status} />
              {/if}
            </div>
            <PreferencesConnectionActions
              provider={provider}
              connection={vmConnection}
              connectionStatus={containerConnectionStatus.get(getProviderConnectionName(provider, vmConnection))}
              updateConnectionStatus={updateContainerStatus}
              addConnectionToRestartingQueue={addConnectionToRestartingQueue}>
              {#snippet advanced_actions()}
                <span  class:hidden={providers.length === 0}>
                  <Tooltip bottom tip="More Options">
                    <ActionsMenu dropdownMenu={true}>
                      <DropdownMenu.Item title="Open Terminal" icon={faTerminal} onClick={(): void => router.goto(
                        `/preferences/vm-connection/${provider.internalId}/${vmConnection.name}/terminal`,
                      )}/>
                    </ActionsMenu>
                  </Tooltip>
                </span>
              {/snippet}
            </PreferencesConnectionActions>
          </div>
        {/each}
        </div>
      </div>
    {/each}
  </div>
  {#if displayInstallModal && providerToBeInstalled}
    <PreferencesProviderInstallationModal
      providerToBeInstalled={providerToBeInstalled}
      preflightChecks={preflightChecks}
      closeCallback={hideInstallModal}
      doCreateNew={doCreateNew} />
  {/if}
</SettingsPage>
