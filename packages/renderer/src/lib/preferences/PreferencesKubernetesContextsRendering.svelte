<script lang="ts">
import SettingsPage from './SettingsPage.svelte';
import EngineIcon from '../ui/EngineIcon.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';
import { faTrash, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import { kubernetesContexts } from '../../stores/kubernetes-contexts';
import { clearKubeUIContextErrors, setKubeUIContextError } from '../kube/KubeContextUI';

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
      buttons: ['Yes', 'No'],
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
          <div class="text-xs bg-charcoal-800 p-2 rounded-lg mt-1 grid grid-cols-6">
            <span class="my-auto font-bold col-span-1 text-right">CLUSTER</span>
            <span class="my-auto col-span-5 text-left pl-0.5 ml-3" aria-label="context-cluster">{context.cluster}</span>
          </div>

          {#if context.clusterInfo !== undefined}
            <div class="text-xs bg-charcoal-800 p-2 rounded-lg mt-1 grid grid-cols-6">
              <span class="my-auto font-bold col-span-1 text-right">SERVER</span>
              <span class="my-auto col-span-5 text-left ml-3">
                {context.clusterInfo.server}
              </span>
            </div>
          {/if}

          <div class="text-xs bg-charcoal-800 p-2 rounded-lg mt-1 grid grid-cols-6">
            <span class="my-auto font-bold col-span-1 text-right">USER</span>
            <span class="my-auto col-span-5 text-left pl-0.5 ml-3" aria-label="context-user">{context.user}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>
</SettingsPage>
