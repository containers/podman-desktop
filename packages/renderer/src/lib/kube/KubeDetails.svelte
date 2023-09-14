<script lang="ts">
import Route from '../../Route.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import Tab from '../ui/Tab.svelte';
import { lastPage } from '../../stores/breadcrumb';
import { onMount } from 'svelte';
import type { V1Pod } from '@kubernetes/client-node';
import KubeDetailsSummary from './KubeDetailsSummary.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import PodIcon from '../images/PodIcon.svelte';
import KubeDetailsLogs from './KubeDetailsLogs.svelte';
import KubeDetailsYaml from './KubeDetailsYaml.svelte';

export let namespace: string;
export let name: string;

let pod: V1Pod;

// TEMP TO DO / FIX IN THE FUTURE
// TODO: Fix the "path" of the last page.. unsure why it's going "Home"
// for now, change it to /kubernetes/<objectType>
$lastPage.path = `/kubernetes/components/pods`;
// Set the name of the last page to the objectName as well as capitalized

$lastPage.name = 'Pods';

// END TEMP TO DO / FIX IN THE FUTURE

// On mount get the namespaced pod information using window.kubernetesRedNamespacedPod
onMount(async () => {
  // Get the kube pod information (this will return V1Pod object that we can use)
  const kubepod = await window.kubernetesReadNamespacedPod(name, namespace);
  if (kubepod) {
    pod = kubepod;
  }
});

// TODO FIX IN FUTURE
// Convert pod V1Pod to PodUIInfo
// const podUtils = new PodUtils();
// pod = podUtils.getPodInfoUI(pod);
// END TODO FIX IN FUTURE
</script>

<DetailsPage title="{name}" subtitle="">
  <!-- TODO: Fix status not showing correctly? -->
  <StatusIcon slot="icon" icon="{PodIcon}" status="{pod?.status?.phase}" />
  <svelte:fragment slot="actions"></svelte:fragment>
  <svelte:fragment slot="tabs">
    <Tab title="Summary" url="summary" />
    <Tab title="Logs" url="logs" />
    <Tab title="Yaml" url="yaml" />
  </svelte:fragment>
  <svelte:fragment slot="content">
    <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
      <KubeDetailsSummary pod="{pod}" />
    </Route>
    <Route path="/logs" breadcrumb="Logs" navigationHint="tab">
      <KubeDetailsLogs pod="{pod}" />
    </Route>
    <Route path="/yaml" breadcrumb="Yaml" navigationHint="tab">
      <KubeDetailsYaml pod="{pod}" />
    </Route>
  </svelte:fragment>
</DetailsPage>
