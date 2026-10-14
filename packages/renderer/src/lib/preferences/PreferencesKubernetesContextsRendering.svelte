<script lang="ts">
import type { KubeContext, SelectedResourceName } from '@desktop-framework/api';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faCopy, faPenToSquare, faRightToBracket, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button, EmptyScreen, ErrorMessage, Spinner, Tooltip } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { onMount } from 'svelte';
import { router } from 'tinro';

import { clearKubeUIContextErrors, setKubeUIContextError } from '/@/lib/kube/KubeContextUI';
import EngineIcon from '/@/lib/ui/EngineIcon.svelte';
import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';
import { kubernetesContextsHealths } from '/@/stores/kubernetes-context-health';
import { kubernetesContextsPermissions } from '/@/stores/kubernetes-context-permission';
import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import { kubernetesContextsCheckingStateDelayed, kubernetesContextsState } from '/@/stores/kubernetes-contexts-state';
import { kubernetesResourcesCount } from '/@/stores/kubernetes-resources-count';

import PreferencesKubernetesContextsRenderingEditModal from './PreferencesKubernetesContextsRenderingEditModal.svelte';
import SettingsPage from './SettingsPage.svelte';

interface KubeContextWithStates extends KubeContext {
  // some informers have been disconnected, and their caches are still populated with the last seen resources
  isOffline: boolean;
  // the context has been marked as reachable (during health check in experimental mode)
  // the context will still be marked as reachable even if it is offline
  isReachable: boolean;
  isKnown: boolean;
  isBeingChecked: boolean;
  podsCount?: number;
  deploymentsCount?: number;
  podsPermitted: boolean;
  deploymentsPermitted: boolean;
  notPermittedHelp?: string;
  errorMessage?: string;
}

const currentContextName = $derived($kubernetesContexts.find(c => c.currentContext)?.name);

let kubeconfigFilePath: string = $state('');
let experimentalStates: boolean = $state(false);

const kubernetesContextsWithStates: KubeContextWithStates[] = $derived(
  $kubernetesContexts
    .map(kubeContext => ({
      ...kubeContext,
      isReachable: isContextReachable(kubeContext.name, experimentalStates),
      isOffline: isContextOffline(kubeContext.name, experimentalStates),
      isKnown: isContextKnown(kubeContext.name, experimentalStates),
      isBeingChecked: isContextBeingChecked(kubeContext.name, experimentalStates),
      podsCount: getResourcesCount(kubeContext.name, 'pods', experimentalStates),
      deploymentsCount: getResourcesCount(kubeContext.name, 'deployments', experimentalStates),
      podsPermitted: getResourcePermitted(kubeContext.name, 'pods', experimentalStates),
      deploymentsPermitted: getResourcePermitted(kubeContext.name, 'deployments', experimentalStates),
      errorMessage: getErrorMessage(kubeContext.name, experimentalStates),
    }))
    .map(kubeContext => ({
      ...kubeContext,
      notPermittedHelp: getNotPermittedHelp(kubeContext.podsPermitted, kubeContext.deploymentsPermitted),
    })),
);

onMount(async () => {
  try {
    const val: string | undefined = await window.getConfigurationValue('kubernetes.Kubeconfig');
    if (val !== undefined) {
      kubeconfigFilePath = val;
    } else {
      kubeconfigFilePath = 'Default is usually ~/.kube/config';
    }
  } catch (error) {
    kubeconfigFilePath = 'Default is usually ~/.kube/config';
  }

  try {
    experimentalStates = await window.isExperimentalConfigurationEnabled('kubernetes.statesExperimental');
  } catch {
    // keep default value
  }
});

async function handleSetContext(contextName: string): Promise<void> {
  $kubernetesContexts = clearKubeUIContextErrors($kubernetesContexts);
  try {
    await window.kubernetesSetContext(contextName);
  } catch (e: unknown) {
    if (e instanceof Error) {
      $kubernetesContexts = setKubeUIContextError($kubernetesContexts, contextName, e);
    }
  }
}

async function handleDeleteContext(contextName: string): Promise<void> {
  if (currentContextName === contextName) {
    const result = await window.showMessageBox({
      title: 'Delete Context?',
      type: 'danger',
      message:
        'You will delete the current context. If you delete it, you will need to switch to another context. Continue?',
      buttons: ['Delete', 'Cancel'],
    });
    if (result.response !== 'Delete') {
      return;
    }
  }
  $kubernetesContexts = clearKubeUIContextErrors($kubernetesContexts);
  try {
    await window.kubernetesDeleteContext(contextName);
  } catch (e: unknown) {
    if (e instanceof Error) {
      $kubernetesContexts = setKubeUIContextError($kubernetesContexts, contextName, e);
    }
  }
}

let editContextModal: boolean = $state(false);
let contextToEdit: KubeContext | undefined = $state();
function closeModals(): void {
  editContextModal = false;
}

async function handleDuplicateContext(contextName: string): Promise<void> {
  await window.kubernetesDuplicateContext(contextName);
}

async function handleEditContext(context: KubeContextWithStates): Promise<void> {
  contextToEdit = context as KubeContext;
  editContextModal = true;
}

function isContextReachable(contextName: string, experimental: boolean): boolean {
  if (experimental) {
    return $kubernetesContextsHealths.some(
      contextHealth => contextHealth.contextName === contextName && contextHealth.reachable,
    );
  }
  return $kubernetesContextsState.get(contextName)?.reachable ?? false;
}

function getErrorMessage(contextName: string, experimental: boolean): string | undefined {
  if (experimental) {
    return $kubernetesContextsHealths.find(contextHealth => contextHealth.contextName === contextName)?.errorMessage;
  }
}

function isContextOffline(contextName: string, experimental: boolean): boolean {
  if (experimental) {
    return $kubernetesContextsHealths.some(
      contextHealth => contextHealth.contextName === contextName && contextHealth.offline,
    );
  }
  return false; // not implement in non-experimental mode
}

function isContextKnown(contextName: string, experimental: boolean): boolean {
  if (experimental) {
    return $kubernetesContextsHealths.some(contextHealth => contextHealth.contextName === contextName);
  }
  return !!$kubernetesContextsState.get(contextName);
}

function isContextBeingChecked(contextName: string, experimental: boolean): boolean {
  if (experimental) {
    return $kubernetesContextsHealths.some(
      contextHealth => contextHealth.contextName === contextName && contextHealth.checking,
    );
  }
  return !!$kubernetesContextsCheckingStateDelayed?.get(contextName);
}

function getResourcesCount(
  contextName: string,
  resourceName: SelectedResourceName,
  experimental: boolean,
): number | undefined {
  if (experimental) {
    return $kubernetesResourcesCount.find(
      resourcesCount => resourcesCount.contextName === contextName && resourcesCount.resourceName === resourceName,
    )?.count;
  }
  return $kubernetesContextsState.get(contextName)?.resources[resourceName];
}

function getResourcePermitted(contextName: string, resourceName: SelectedResourceName, experimental: boolean): boolean {
  if (experimental) {
    const permission = $kubernetesContextsPermissions.find(
      permissions => permissions.contextName === contextName && permissions.resourceName === resourceName,
    );
    if (!permission) {
      return false;
    }
    return permission.permitted;
  }
  return true;
}

function getNotPermittedHelp(podsPermitted: boolean, deploymentsPermitted: boolean): string {
  const notPermitted = [];
  if (!podsPermitted) {
    notPermitted.push('Pods');
  }
  if (!deploymentsPermitted) {
    notPermitted.push('Deployments');
  }
  if (!notPermitted.length) {
    return '';
  }
  return notPermitted.join(' and ') + ' are not accessible';
}

async function connect(contextName: string): Promise<void> {
  await window.telemetryTrack('kubernetes.monitoring.start.non-current');
  $kubernetesContexts = clearKubeUIContextErrors($kubernetesContexts, contextName);
  window.kubernetesRefreshContextState(contextName).catch((e: unknown) => {
    if (e instanceof Error) {
      $kubernetesContexts = setKubeUIContextError($kubernetesContexts, contextName, e);
    }
  });
}
</script>

<SettingsPage title="Kubernetes Contexts">
  <div role="table" aria-label="Contexts">
    <!-- Use KubernetesIcon in the future / not EngineIcon -->
    <EmptyScreen
      aria-label="No Resource Panel"
      icon={EngineIcon}
      title="No Kubernetes contexts found"
      message="Check that Kubernetes context is created and selected. You can create local Kubernetes cluster from Podman Desktop. Path to the Kubeconfig file for accessing clusters: {kubeconfigFilePath}"
      hidden={$kubernetesContexts.length > 0}>
      <Button
        class="py-3"
        on:click={(): void => {
          router.goto('/preferences/resources');
        }}>
        Go to Resources
      </Button>
    </EmptyScreen>
    {#each kubernetesContextsWithStates as context, index (index)}
      <!-- If current context, use lighter background -->
      <div
        role="row"
        aria-label={context.name}
        class="bg-[var(--pd-invert-content-card-bg)] mb-5 rounded-md p-3 flex-nowrap">
        <div class="pb-2">
          <div class="flex">
            {#if context?.icon}
              {#if typeof context.icon === 'string'}
                <img
                  src={context.icon}
                  aria-label="Context Logo"
                  alt="{context.name} logo"
                  class="max-w-[40px] h-full" />
              {/if}
            {/if}
            <!-- Centered items div -->
            <div class="pl-3 grow flex flex-col justify-center">
              <div class="flex flex-col items-left">
                {#if context.currentContext}
                  <span class="text-sm text-[var(--pd-invert-content-card-text)]" aria-label="Current Context"
                    >Current Context</span>
                {/if}
                <span class="font-semibold text-[var(--pd-invert-content-card-header-text)]" aria-label="Context Name"
                  >{context.name}</span>
              </div>
            </div>
            <!-- Only show the set context button if it is not the current context -->
            {#if !context.currentContext}
              <ListItemButtonIcon
                title="Set as Current Context"
                icon={faRightToBracket}
                onClick={(): Promise<void> => handleSetContext(context.name)}></ListItemButtonIcon>
            {/if}
            <ListItemButtonIcon title="Duplicate Context" icon={faCopy} onClick={(): Promise<void> => handleDuplicateContext(context.name)}
            ></ListItemButtonIcon>
            <ListItemButtonIcon title="Edit Context" icon={faPenToSquare} onClick={(): Promise<void> => handleEditContext(context)}
              ></ListItemButtonIcon>
            <ListItemButtonIcon title="Delete Context" icon={faTrash} onClick={(): Promise<void> => handleDeleteContext(context.name)}
            ></ListItemButtonIcon>
          </div>
          {#if context.error}
            <ErrorMessage class="text-sm" aria-label="Context Error" error={context.error} />
          {/if}
        </div>
        <div class="grow flex-column divide-(--pd-invert-content-divider) text-(--pd-invert-content-card-text)">
          <div class="flex flex-row">
            <div class="flex-none w-36">
              {#if context.isReachable || context.isOffline}
                <div class="flex flex-row pt-2">
                  {#if context.isOffline}
                    <Tooltip class="flex flex-row" tip="connection lost, resources may be out of sync">
                      <div class="w-3 h-3 rounded-full bg-[var(--pd-status-paused)]"></div>
                      <div
                        class="ml-1 font-bold text-[9px] text-[var(--pd-status-paused)]"
                        aria-label="Context connection lost">
                        CONNECTION LOST
                      </div>
                    </Tooltip>
                  {:else}
                    <div class="w-3 h-3 rounded-full bg-[var(--pd-status-connected)]"></div>
                    <div
                      class="ml-1 font-bold text-[9px] text-[var(--pd-status-connected)]"
                      aria-label="Context Reachable">
                      REACHABLE
                    </div>
                  {/if}
                </div>
                <div class="flex flex-row gap-4 mt-4">
                  <div class="text-center">
                    <div class="font-bold text-[9px] text-[var(--pd-invert-content-card-text)]" class:opacity-60={!context.podsPermitted}>PODS</div>
                    <div class="text-[16px] text-[var(--pd-invert-content-card-text)]" class:opacity-60={!context.podsPermitted} aria-label="Context Pods Count">
                      {#if context.podsPermitted}
                        {#if context.podsCount !== undefined}{context.podsCount}{/if}
                      {:else}-{/if}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="font-bold text-[9px] text-[var(--pd-invert-content-card-text)]" class:opacity-60={!context.deploymentsPermitted}>DEPLOYMENTS</div>
                    <div
                      class="text-[16px] text-[var(--pd-invert-content-card-text)]"
                      class:opacity-60={!context.deploymentsPermitted}
                      aria-label="Context Deployments Count">
                      {#if context.deploymentsPermitted}
                        {#if context.deploymentsCount !== undefined}{context.deploymentsCount}{/if}
                      {:else}-{/if}
                    </div>
                  </div>
                </div>
                {#if context.isOffline}
                  <div><Button on:click={(): Promise<void> => connect(context.name)}>Connect</Button></div>
                {/if}
                {#if !context.podsPermitted || !context.deploymentsPermitted}
                  <Tooltip tip={context.notPermittedHelp}><div><Icon size="1x" icon={faQuestionCircle} /></div></Tooltip>
                {/if}
              {:else}
                <div class="flex flex-col space-y-2">
                  <div class="flex flex-row pt-2">
                    {#if context.errorMessage}
                      <div class="w-3 h-3 rounded-full bg-[var(--pd-status-dead)]"></div>
                      <div class="ml-1 text-xs text-[var(--pd-status-dead)]" aria-label="Error">
                        <Tooltip>
                          <div>ERROR</div>
                          {#snippet tipSnippet()}
                          <div class="p-2">
                            {#if context.errorMessage}
                              {#each context.errorMessage.split('\n').filter(l => l) as line, index (index)}
                                <p>{line}</p>
                              {/each}
                            {/if}
                          </div>
                          {/snippet}
                        </Tooltip>
                      </div>
                    {:else}
                      <div class="w-3 h-3 rounded-full bg-[var(--pd-status-disconnected)]"></div>
                      <div class="ml-1 text-xs text-[var(--pd-status-disconnected)]" aria-label="Context Unreachable">
                        {#if context.isKnown}
                          UNREACHABLE
                        {:else}
                          UNKNOWN
                        {/if}
                      </div>
                    {/if}
                    {#if context.isBeingChecked}
                      <div class="ml-1"><Spinner size="12px"></Spinner></div>
                    {/if}
                  </div>
                  {#if !$kubernetesContextsState.get(context.name)}
                    <div><Button on:click={(): Promise<void> => connect(context.name)}>Connect</Button></div>
                  {/if}
                </div>
              {/if}
            </div>
            <div class="grow text-sm">
              <div class="bg-[var(--pd-invert-content-bg)] p-2 rounded-lg mt-1 grid grid-cols-6">
                <span class="my-auto font-bold col-span-1 text-right overflow-hidden text-ellipsis">CLUSTER</span>
                <span
                  class="my-auto col-span-5 text-left ml-3 overflow-hidden text-ellipsis"
                  aria-label="Context Cluster">{context.cluster}</span>
              </div>

              {#if context.clusterInfo !== undefined}
                <div class="bg-[var(--pd-invert-content-bg)] p-2 rounded-lg mt-1 grid grid-cols-6">
                  <span class="my-auto font-bold col-span-1 text-right overflow-hidden text-ellipsis">SERVER</span>
                  <span
                    class="my-auto col-span-5 text-left ml-3 overflow-hidden text-ellipsis"
                    aria-label="Context Server"
                    >{context.clusterInfo.server}
                  </span>
                </div>
              {/if}

              <div class="bg-[var(--pd-invert-content-bg)] p-2 rounded-lg mt-1 grid grid-cols-6">
                <span class="my-auto font-bold col-span-1 text-right overflow-hidden text-ellipsis">USER</span>
                <span class="my-auto col-span-5 text-left ml-3 overflow-hidden text-ellipsis" aria-label="Context User"
                  >{context.user}</span>
              </div>

              {#if context.namespace}
                <div class="bg-[var(--pd-invert-content-bg)] p-2 rounded-lg mt-1 grid grid-cols-6">
                  <span class="my-auto font-bold col-span-1 text-right overflow-hidden text-ellipsis">NAMESPACE</span>
                  <span
                    class="my-auto col-span-5 text-left ml-3 overflow-hidden text-ellipsis"
                    aria-label="Context Namespace">{context.namespace}</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
  {#if editContextModal && contextToEdit}
    <PreferencesKubernetesContextsRenderingEditModal
      contextToEdit={contextToEdit}
      detailed={true}
      closeCallback={closeModals} />
  {/if}
</SettingsPage>
