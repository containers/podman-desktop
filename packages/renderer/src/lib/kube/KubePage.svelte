<script lang="ts">
import Route from '../../Route.svelte';
import KubePodsList from './KubePodsList.svelte';
import KubeDeploymentList from './KubeDeploymentList.svelte';
import KubeConfigmapList from './KubeConfigmapList.svelte';
import KubePVCList from './KubePVCList.svelte';
import KubeServiceList from './KubeServiceList.svelte';
import KubeIngressList from './KubeIngressList.svelte';
import KubeDetails from './KubeDetails.svelte';
</script>

<div class="flex flex-col min-w-full h-full">
  <Route path="/components/pods" breadcrumb="Kubernetes">
    <KubePodsList />
  </Route>

  <Route path="/details/pods/:namespace/:name/*" breadcrumb="Kubernetes" let:meta>
    <KubeDetails namespace="{meta.params.namespace}" name="{meta.params.name}" />
  </Route>

  <!-- Add the rest once properly implemenented 
  <Route path="/components/" breadcrumb="Kubernetes">
    <KubeDeploymentList />
  </Route>
  <Route path="/configmaps" breadcrumb="Kubernetes">
    <KubeConfigmapList />
  </Route>
  <Route path="/pvc" breadcrumb="Kubernetes">
    <KubePVCList />
  </Route>
  <Route path="/services" breadcrumb="Kubernetes">
    <KubeServiceList />
  </Route>
  <Route path="/ingress" breadcrumb="Kubernetes">
    <KubeIngressList />
  </Route>
  -->
</div>
