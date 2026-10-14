<script lang="ts">
import type { IDisposable } from '@desktop-framework/api';
import type { KubernetesObject, V1ConfigMap } from '@kubernetes/client-node';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';
import ConfigMapIcon from '/@/lib/images/ConfigMapSecretIcon.svelte';
import KubeEditYAML from '/@/lib/kube/KubeEditYAML.svelte';
import { listenResource } from '/@/lib/kube/resource-listen';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import StateChange from '/@/lib/ui/StateChange.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import Route from '/@/Route.svelte';
import { kubernetesCurrentContextConfigMaps } from '/@/stores/kubernetes-contexts-state';

import { ConfigMapSecretUtils } from './configmap-secret-utils';
import ConfigMapDetailsSummary from './ConfigMapDetailsSummary.svelte';
import ConfigMapSecretActions from './ConfigMapSecretActions.svelte';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

interface Props {
  name: string;
  namespace: string;
}
let { name, namespace }: Props = $props();

let configMap: ConfigMapSecretUI | undefined = $state(undefined);
let detailsPage: DetailsPage | undefined = $state(undefined);
let kubeConfigMap: V1ConfigMap | undefined = $state(undefined);
let kubeError: string | undefined = $state(undefined);

let listener: IDisposable | undefined;

onMount(async () => {
  const configMapUtils = new ConfigMapSecretUtils();
  listener = await listenResource({
    resourceName: 'configmaps',
    name,
    namespace,
    listenEvents: false,
    legacyResourceStore: kubernetesCurrentContextConfigMaps,
    onResourceNotFound: () => {
      if (detailsPage) {
        // the deployment has been deleted
        detailsPage.close();
      }
    },
    onResourceUpdated: (resource: KubernetesObject, isExperimental: boolean) => {
      configMap = configMapUtils.getConfigMapSecretUI(resource);
      if (isExperimental) {
        kubeConfigMap = resource;
      } else {
        loadDetails().catch((err: unknown) => console.error(`Error getting config map ${name} details`, err));
      }
    },
  });
});

onDestroy(() => {
  listener?.dispose();
});

async function loadDetails(): Promise<void> {
  const getKubeConfigMap = await window.kubernetesReadNamespacedConfigMap(name, namespace);
  if (getKubeConfigMap) {
    kubeConfigMap = getKubeConfigMap;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${name}`;
  }
}
</script>

{#if configMap}
  <DetailsPage title={configMap.name} subtitle={configMap.namespace} bind:this={detailsPage}>
    {#snippet iconSnippet()}
      {#if configMap}<StatusIcon icon={ConfigMapIcon} size={24} status={configMap.status} />{/if}
    {/snippet}
    {#snippet actionsSnippet()}
      {#if configMap}<ConfigMapSecretActions configMapSecret={configMap} detailed={true} />{/if}
    {/snippet}
    {#snippet detailSnippet()}
      {#if configMap}
        <div class="flex py-2 w-full justify-end text-sm text-[var(--pd-content-text)]">
          <StateChange state={configMap.status} />
        </div>
      {/if}
    {/snippet}
    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    {/snippet}
    {#snippet contentSnippet()}
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ConfigMapDetailsSummary configMap={kubeConfigMap} kubeError={kubeError} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content={JSON.stringify(kubeConfigMap, undefined, 2)} language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content={stringify(kubeConfigMap)} />
      </Route>
    {/snippet}
  </DetailsPage>
{/if}
