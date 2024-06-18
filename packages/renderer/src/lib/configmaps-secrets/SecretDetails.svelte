<script lang="ts">
import type { V1Secret } from '@kubernetes/client-node';
import { Tab } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import { kubernetesCurrentContextSecrets } from '/@/stores/kubernetes-contexts-state';

import Route from '../../Route.svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import SecretIcon from '../images/ConfigMapSecretIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import KubeEditYAML from '../kube/KubeEditYAML.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import StateChange from '../ui/StateChange.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
import { ConfigMapSecretUtils } from './configmap-secret-utils';
import ConfigMapSecretActions from './ConfigMapSecretActions.svelte';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';
import SecretDetailsSummary from './SecretDetailsSummary.svelte';

export let name: string;
export let namespace: string;

let secret: ConfigMapSecretUI;
let detailsPage: DetailsPage;
let kubeSecret: V1Secret | undefined;
let kubeError: string;

onMount(() => {
  const secretUtils = new ConfigMapSecretUtils();
  // loading secret info
  return kubernetesCurrentContextSecrets.subscribe(secrets => {
    const matchingSecret = secrets.find(
      secret => secret.metadata?.name === name && secret.metadata?.namespace === namespace,
    );
    if (matchingSecret) {
      try {
        secret = secretUtils.getConfigMapSecretUI(matchingSecret);
        loadDetails();
      } catch (err) {
        console.error(err);
      }
    } else if (detailsPage) {
      // the secret has been deleted
      detailsPage.close();
    }
  });
});

async function loadDetails() {
  const getKubeSecret = await window.kubernetesReadNamespacedSecret(secret.name, namespace);
  if (getKubeSecret) {
    kubeSecret = getKubeSecret;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${secret.name}`;
  }
}
</script>

{#if secret}
  <DetailsPage title="{secret.name}" subtitle="{secret.namespace}" bind:this="{detailsPage}">
    <StatusIcon slot="icon" icon="{SecretIcon}" size="{24}" status="{secret.status}" />
    <svelte:fragment slot="actions">
      <ConfigMapSecretActions configMapSecret="{secret}" detailed="{true}" on:update="{() => (secret = secret)}" />
    </svelte:fragment>
    <div slot="detail" class="flex py-2 w-full justify-end text-sm text-gray-700">
      <StateChange state="{secret.status}" />
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
        <SecretDetailsSummary secret="{kubeSecret}" kubeError="{kubeError}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content="{JSON.stringify(kubeSecret, undefined, 2)}" language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content="{stringify(kubeSecret)}" />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
