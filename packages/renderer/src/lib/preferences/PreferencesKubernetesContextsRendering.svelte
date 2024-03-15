<script lang="ts">
import { faRightToBracket, faTrash } from '@fortawesome/free-solid-svg-icons';

import { kubernetesContextsState } from '/@/stores/kubernetes-contexts-state';

import { kubernetesContexts } from '../../stores/kubernetes-contexts';
import { clearKubeUIContextErrors, setKubeUIContextError } from '../kube/KubeContextUI';
import EmptyScreen from '../ui/EmptyScreen.svelte';
import EngineIcon from '../ui/EngineIcon.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import SettingsPage from './SettingsPage.svelte';

$: currentContextName = $kubernetesContexts.find(c => c.currentContext)?.name;

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
  <div class="h-full" role="table" aria-label="contexts">
    <!-- Use KubernetesIcon in the future / not EngineIcon -->
    <EmptyScreen
      aria-label="no-resource-panel"
      icon="{EngineIcon}"
      title="No Kubernetes contexts found"
      message="Check that $HOME/.kube/config exists or KUBECONFIG environment variable has been set correctly."
      hidden="{$kubernetesContexts.length > 0}" />
    {#each $kubernetesContexts as context}
      <!-- If current context, use lighter background -->
      <div
        role="row"
        class="{context.currentContext ? 'bg-charcoal-600' : 'bg-charcoal-700'} mb-5 rounded-md p-3 flex-nowrap">
        <div class="pb-2">
          <div class="flex">
            {#if context?.icon}
              {#if typeof context.icon === 'string'}
                <img
                  src="{context.icon}"
                  aria-label="context-logo"
                  alt="{context.name} logo"
                  class="max-w-[40px] h-full" />
              {/if}
            {/if}
            <!-- Centered items div -->
            <div class="pl-3 flex-grow flex flex-col justify-center">
              <div class="flex flex-col items-left">
                {#if context.currentContext}
                  <span class="text-xs text-gray-600" aria-label="current-context">Current Context</span>
                {/if}
                <span class="text-md" aria-label="context-name">{context.name}</span>
              </div>
            </div>
            <!-- Only show the set context button if it is not the current context -->
            {#if !context.currentContext}
              <ListItemButtonIcon
                title="Set as Current Context"
                icon="{faRightToBracket}"
                onClick="{() => handleSetContext(context.name)}"></ListItemButtonIcon>
            {/if}
            <ListItemButtonIcon
              title="Delete Context"
              icon="{faTrash}"
              onClick="{() => handleDeleteContext(context.name)}"></ListItemButtonIcon>
          </div>
          {#if context.error}
            <ErrorMessage class="text-sm" error="{context.error}" />
          {/if}
        </div>
        <div class="grow flex-column divide-gray-900 text-gray-400">
          <div class="flex flex-row">
            {#if $kubernetesContextsState.get(context.name)}
              <div class="flex-none w-36">
                {#if $kubernetesContextsState.get(context.name)?.reachable}
                  <div class="flex flex-row pt-2">
                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                    <div class="ml-1 font-bold text-[9px] text-green-500" aria-label="context-reachable">REACHABLE</div>
                  </div>
                  <div class="flex flex-row gap-4 mt-4">
                    <div class="text-center">
                      <div class="font-bold text-[9px] text-gray-800">PODS</div>
                      <div class="text-[16px] text-white" aria-label="context-pods-count">
                        {$kubernetesContextsState.get(context.name)?.resources.pods}
                      </div>
                    </div>
                    <div class="text-center">
                      <div class="font-bold text-[9px] text-gray-800">DEPLOYMENTS</div>
                      <div class="text-[16px] text-white" aria-label="context-deployments-count">
                        {$kubernetesContextsState.get(context.name)?.resources.deployments}
                      </div>
                    </div>
                  </div>
                {:else}
                  <div class="flex flex-row pt-2">
                    <div class="w-3 h-3 rounded-full bg-gray-900"></div>
                    <div class="ml-1 font-bold text-[9px] text-gray-900">UNREACHABLE</div>
                  </div>
                {/if}
              </div>
            {/if}
            <div class="grow">
              <div class="text-xs bg-charcoal-800 p-2 rounded-lg mt-1 grid grid-cols-6">
                <span class="my-auto font-bold col-span-1 text-right overflow-hidden text-ellipsis">CLUSTER</span>
                <span
                  class="my-auto col-span-5 text-left pl-0.5 ml-3 overflow-hidden text-ellipsis"
                  aria-label="context-cluster">{context.cluster}</span>
              </div>

              {#if context.clusterInfo !== undefined}
                <div class="text-xs bg-charcoal-800 p-2 rounded-lg mt-1 grid grid-cols-6">
                  <span class="my-auto font-bold col-span-1 text-right overflow-hidden text-ellipsis">SERVER</span>
                  <span class="my-auto col-span-5 text-left ml-3 overflow-hidden text-ellipsis">
                    {context.clusterInfo.server}
                  </span>
                </div>
              {/if}

              <div class="text-xs bg-charcoal-800 p-2 rounded-lg mt-1 grid grid-cols-6">
                <span class="my-auto font-bold col-span-1 text-right overflow-hidden text-ellipsis">USER</span>
                <span
                  class="my-auto col-span-5 text-left pl-0.5 ml-3 overflow-hidden text-ellipsis"
                  aria-label="context-user">{context.user}</span>
              </div>

              {#if context.namespace}
                <div class="text-xs bg-charcoal-800 p-2 rounded-lg mt-1 grid grid-cols-6">
                  <span class="my-auto font-bold col-span-1 text-right overflow-hidden text-ellipsis">NAMESPACE</span>
                  <span
                    class="my-auto col-span-5 text-left pl-0.5 ml-3 overflow-hidden text-ellipsis"
                    aria-label="context-namespace">{context.namespace}</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
</SettingsPage>
