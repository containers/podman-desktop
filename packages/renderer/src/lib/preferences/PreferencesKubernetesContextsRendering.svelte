<script lang="ts">
import { faRightToBracket, faTrash } from '@fortawesome/free-solid-svg-icons';
import { EmptyScreen, ErrorMessage, Spinner } from '@podman-desktop/ui-svelte';

import { kubernetesContextsCheckingState, kubernetesContextsState } from '/@/stores/kubernetes-contexts-state';

import { kubernetesContexts } from '../../stores/kubernetes-contexts';
import { clearKubeUIContextErrors, setKubeUIContextError } from '../kube/KubeContextUI';
import EngineIcon from '../ui/EngineIcon.svelte';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import SettingsPage from './SettingsPage.svelte';

$: currentContextName = $kubernetesContexts.find(c => c.currentContext)?.name;

let previousState = new Map<string, 'waiting' | 'checking' | 'gaveup'>();
let checkingCount = new Map<string, number>();
$: {
  for (const [context, state] of $kubernetesContextsCheckingState) {
    if (!previousState.has(context) || previousState.get(context) !== state.state) {
      if (state.state === 'checking') {
        const prev = checkingCount.get(context) ?? 0;
        checkingCount.set(context, prev + 1);
        checkingCount = new Map(checkingCount);
      } else if (state.state === 'waiting' && (checkingCount.get(context) ?? 0) > 0) {
        const prev = checkingCount.get(context) ?? 0;
        setTimeout(() => {
          checkingCount.set(context, prev - 1);
          checkingCount = new Map(checkingCount);
        }, 2000);
      }
      previousState.set(context, state.state);
    }
  }
}

async function handleSetContext(contextName: string) {
  $kubernetesContexts = clearKubeUIContextErrors($kubernetesContexts);
  try {
    await window.kubernetesSetContext(contextName);
  } catch (e: unknown) {
    if (e instanceof Error) {
      $kubernetesContexts = setKubeUIContextError($kubernetesContexts, contextName, e);
    }
  }
}

async function handleDeleteContext(contextName: string) {
  if (currentContextName === contextName) {
    const result = await window.showMessageBox({
      title: 'Delete Context',
      message:
        'You will delete the current context. If you delete it, you will need to switch to another context. Continue?',
      buttons: ['Yes', 'Cancel'],
    });
    if (result.response !== 0) {
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
</script>

<SettingsPage title="Kubernetes Contexts">
  <div class="h-full" role="table" aria-label="Contexts">
    <!-- Use KubernetesIcon in the future / not EngineIcon -->
    <EmptyScreen
      aria-label="No Resource Panel"
      icon={EngineIcon}
      title="No Kubernetes contexts found"
      message="Check that $HOME/.kube/config exists or KUBECONFIG environment variable has been set correctly."
      hidden={$kubernetesContexts.length > 0} />
    {#each $kubernetesContexts as context}
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
            <div class="pl-3 flex-grow flex flex-col justify-center">
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
                onClick={() => handleSetContext(context.name)}></ListItemButtonIcon>
            {/if}
            <ListItemButtonIcon title="Delete Context" icon={faTrash} onClick={() => handleDeleteContext(context.name)}
            ></ListItemButtonIcon>
          </div>
          {#if context.error}
            <ErrorMessage class="text-sm" aria-label="Context Error" error={context.error} />
          {/if}
        </div>
        <div class="grow flex-column divide-gray-900 text-[var(--pd-invert-content-card-text)]">
          <div class="flex flex-row">
            <div class="flex-none w-36">
              {#if $kubernetesContextsState.get(context.name)?.reachable}
                <div class="flex flex-row pt-2">
                  <div class="w-3 h-3 rounded-full bg-[var(--pd-status-connected)]"></div>
                  <div
                    class="ml-1 font-bold text-[9px] text-[var(--pd-status-connected)]"
                    aria-label="Context Reachable">
                    REACHABLE
                  </div>
                </div>
                <div class="flex flex-row gap-4 mt-4">
                  <div class="text-center">
                    <div class="font-bold text-[9px] text-[var(--pd-invert-content-card-text)]">PODS</div>
                    <div class="text-[16px] text-[var(--pd-invert-content-card-text)]" aria-label="Context Pods Count">
                      {$kubernetesContextsState.get(context.name)?.resources.pods}
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="font-bold text-[9px] text-[var(--pd-invert-content-card-text)]">DEPLOYMENTS</div>
                    <div
                      class="text-[16px] text-[var(--pd-invert-content-card-text)]"
                      aria-label="Context Deployments Count">
                      {$kubernetesContextsState.get(context.name)?.resources.deployments}
                    </div>
                  </div>
                </div>
              {:else}
                <div class="flex flex-row pt-2">
                  <div class="w-3 h-3 rounded-full bg-[var(--pd-status-disconnected)]"></div>
                  <div class="ml-1 text-xs text-[var(--pd-status-disconnected)]" aria-label="Context Unreachable">
                    {#if $kubernetesContextsState.get(context.name)}
                      UNREACHABLE
                    {:else}
                      UNKNOWN
                    {/if}
                  </div>
                  {#if (checkingCount.get(context.name) ?? 0) > 0}
                    <div class="ml-1"><Spinner size="12px"></Spinner></div>
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
</SettingsPage>
