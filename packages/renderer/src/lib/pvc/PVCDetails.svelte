<script lang="ts">
import type { V1PersistentVolumeClaim } from '@kubernetes/client-node';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import { kubernetesCurrentContextPersistentVolumeClaims } from '/@/stores/kubernetes-contexts-state';

import Route from '../../Route.svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import PVCIcon from '../images/PVCIcon.svelte';
import KubeEditYAML from '../kube/KubeEditYAML.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import StateChange from '../ui/StateChange.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
import { PVCUtils } from './pvc-utils';
import PVCActions from './PVCActions.svelte';
import PVCDetailsSummary from './PVCDetailsSummary.svelte';
import type { PVCUI } from './PVCUI';

export let name: string;
export let namespace: string;

let pvc: PVCUI;
let detailsPage: DetailsPage;
let kubePVC: V1PersistentVolumeClaim | undefined;
let kubeError: string;

onMount(() => {
  const pvcUtils = new PVCUtils();
  // loading pvc info
  return kubernetesCurrentContextPersistentVolumeClaims.subscribe(pvcs => {
    const matchingPVC = pvcs.find(pvc => pvc.metadata?.name === name && pvc.metadata?.namespace === namespace);
    if (matchingPVC) {
      try {
        pvc = pvcUtils.getPVCUI(matchingPVC);
        loadDetails();
      } catch (err) {
        console.error(err);
      }
    } else if (detailsPage) {
      // the pvc has been deleted
      detailsPage.close();
    }
  });
});

async function loadDetails() {
  const getKubePVC = await window.kubernetesReadNamespacedPersistentVolumeClaim(pvc.name, namespace);
  if (getKubePVC) {
    kubePVC = getKubePVC;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${pvc.name}`;
  }
}
</script>

{#if pvc}
  <DetailsPage title={pvc.name} subtitle={pvc.namespace} bind:this={detailsPage}>
    <StatusIcon slot="icon" icon={PVCIcon} size={24} status={pvc.status} />
    <svelte:fragment slot="actions">
      <PVCActions pvc={pvc} detailed={true} on:update={() => (pvc = pvc)} />
    </svelte:fragment>
    <div slot="detail" class="flex py-2 w-full justify-end text-sm text-gray-700">
      <StateChange state={pvc.status} />
    </div>
    <svelte:fragment slot="tabs">
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <PVCDetailsSummary pvc={kubePVC} kubeError={kubeError} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content={JSON.stringify(kubePVC, undefined, 2)} language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content={stringify(kubePVC)} />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
