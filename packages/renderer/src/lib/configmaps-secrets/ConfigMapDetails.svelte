<script lang="ts">
import type { V1ConfigMap } from '@kubernetes/client-node';
import { Tab } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import { kubernetesCurrentContextConfigMaps } from '/@/stores/kubernetes-contexts-state';

import Route from '../../Route.svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import ConfigMapIcon from '../images/ConfigMapSecretIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import KubeEditYAML from '../kube/KubeEditYAML.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import StateChange from '../ui/StateChange.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
import { ConfigMapSecretUtils } from './configmap-secret-utils';
import ConfigMapDetailsSummary from './ConfigMapDetailsSummary.svelte';
import ConfigMapSecretActions from './ConfigMapSecretActions.svelte';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

export let name: string;
export let namespace: string;

let configMap: ConfigMapSecretUI;
let detailsPage: DetailsPage;
let kubeConfigMap: V1ConfigMap | undefined;
let kubeError: string;

onMount(() => {
  const configMapUtils = new ConfigMapSecretUtils();
  // loading configMap info
  return kubernetesCurrentContextConfigMaps.subscribe(configMaps => {
    const matchingConfigMap = configMaps.find(
      configMap => configMap.metadata?.name === name && configMap.metadata?.namespace === namespace,
    );
    if (matchingConfigMap) {
      try {
        configMap = configMapUtils.getConfigMapSecretUI(matchingConfigMap);
        loadDetails();
      } catch (err) {
        console.error(err);
      }
    } else if (detailsPage) {
      // the configMap has been deleted
      detailsPage.close();
    }
  });
});

async function loadDetails() {
  const getKubeConfigMap = await window.kubernetesReadNamespacedConfigMap(configMap.name, namespace);
  if (getKubeConfigMap) {
    kubeConfigMap = getKubeConfigMap;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${configMap.name}`;
  }
}
</script>

{#if configMap}
  <DetailsPage title="{configMap.name}" subtitle="{configMap.namespace}" bind:this="{detailsPage}">
    <StatusIcon slot="icon" icon="{ConfigMapIcon}" size="{24}" status="{configMap.status}" />
    <svelte:fragment slot="actions">
      <ConfigMapSecretActions
        configMapSecret="{configMap}"
        detailed="{true}"
        on:update="{() => (configMap = configMap)}" />
    </svelte:fragment>
    <div slot="detail" class="flex py-2 w-full justify-end text-sm text-gray-700">
      <StateChange state="{configMap.status}" />
    </div>
    <svelte:fragment slot="tabs">
      <Tab
        title="Summary"
        selected="{isTabSelected($router.path, 'summary')}"
        url="{getTabUrl($router.path, 'summary')}" />
      <Tab
        title="Inspect"
        selected="{isTabSelected($router.path, 'inspect')}"
        url="{getTabUrl($router.path, 'inspect')}" />
      <Tab title="Kube" selected="{isTabSelected($router.path, 'kube')}" url="{getTabUrl($router.path, 'kube')}" />
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ConfigMapDetailsSummary configMap="{kubeConfigMap}" kubeError="{kubeError}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content="{JSON.stringify(kubeConfigMap, undefined, 2)}" language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content="{stringify(kubeConfigMap)}" />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
