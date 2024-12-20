<script lang="ts">
import type { KubernetesObject } from '@kubernetes/client-node';
import { Button } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';
import ProgressBar from '/@/lib/task-manager/ProgressBar.svelte';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import { handleNavigation } from '/@/navigation';
import { lastPage } from '/@/stores/breadcrumb';
import { NavigationPage } from '/@api/navigation-page';

let loading: boolean = $state(false);

let content: string = $state('');

let editorContent: string = $state('');
let changesDetected: boolean = $state(false);

function onContentChange(event: CustomEvent<string>): void {
  changesDetected = event.detail !== content;
  editorContent = event.detail;
}

/**
 * This function try to redirect to the page related to the
 * kubernetes resources created
 * E.g. if the user created a pod, we redirect to the pods page
 */
function smartRedirect(objects: KubernetesObject[]): void {
  // do not try complicated guess, if multiple go back to last page
  if (objects.length !== 1) return onClose();

  // if only one resource is created, go to it
  switch (objects[0].kind) {
    case 'Pod':
      return handleNavigation({
        page: NavigationPage.PODS,
      });
    case 'Service':
      return handleNavigation({
        page: NavigationPage.KUBERNETES_SERVICES,
      });
    case 'PersistentVolumeClaim':
      return handleNavigation({
        page: NavigationPage.KUBERNETES_PVCS,
      });
    case 'ConfigMap':
    case 'Secret':
      return handleNavigation({
        page: NavigationPage.KUBERNETES_CONFIGMAPS_SECRETS,
      });
    case 'Ingress':
      return handleNavigation({
        page: NavigationPage.KUBERNETES_INGRESSES_ROUTES,
      });
    case 'Deployment':
      return handleNavigation({
        page: NavigationPage.KUBERNETES_DEPLOYMENTS,
      });
    default:
      onClose();
  }
}

async function onCreate(): Promise<void> {
  loading = true;
  try {
    let contextName = await window.kubernetesGetCurrentContextName();
    if (!contextName) {
      return;
    }

    let objects: KubernetesObject[] = await window.kubernetesApplyResourcesFromYAML(
      contextName,
      changesDetected ? editorContent : content,
    );
    if (objects.length === 0) {
      await window.showMessageBox({
        title: 'Kubernetes',
        type: 'warning',
        message: `No resource(s) were applied.`,
        buttons: ['OK'],
      });
    } else {
      // where to redirect
      smartRedirect(objects);
    }
  } catch (error: unknown) {
    console.error(error);
    // display error and do not close the page
    await window.showMessageBox({
      title: 'Kubernetes',
      type: 'error',
      message: 'Could not apply Kubernetes YAML: ' + error,
      buttons: ['OK'],
    });
  } finally {
    loading = false;
  }
}

function onClose(): void {
  router.goto($lastPage.path);
}
</script>

<DetailsPage title="Create Resource">
  <svelte:fragment slot="actions">
    <!-- actions button -->
    <Button disabled={loading} title="Create Resource" on:click={onCreate}>Create Resource</Button>
  </svelte:fragment>
  <!-- content -->
  <svelte:fragment slot="content">
    <div class="flex flex-col h-full">
      <!-- loading indicator -->
      {#if loading}
        <ProgressBar class="w-full h-0.5" width="w-full" height="h-0.5"/>
      {/if}

      <!-- editor -->
      <MonacoEditor readOnly={loading} on:contentChange={onContentChange} content={content} language="yaml" />
    </div>
  </svelte:fragment>
</DetailsPage>
