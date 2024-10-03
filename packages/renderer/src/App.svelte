<script lang="ts">
import './app.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { router } from 'tinro';

import { handleNavigation } from '/@/navigation';
import { NO_CURRENT_CONTEXT_ERROR } from '/@api/kubernetes-contexts-states';
import type { NavigationRequest } from '/@api/navigation-request';

import AppNavigation from './AppNavigation.svelte';
import Appearance from './lib/appearance/Appearance.svelte';
import ComposeDetails from './lib/compose/ComposeDetails.svelte';
import ConfigMapDetails from './lib/configmaps-secrets/ConfigMapDetails.svelte';
import ConfigMapSecretList from './lib/configmaps-secrets/ConfigMapSecretList.svelte';
import SecretDetails from './lib/configmaps-secrets/SecretDetails.svelte';
import ContainerDetails from './lib/container/ContainerDetails.svelte';
import ContainerExport from './lib/container/ContainerExport.svelte';
import ContainerList from './lib/container/ContainerList.svelte';
import ContextKey from './lib/context/ContextKey.svelte';
import DashboardPage from './lib/dashboard/DashboardPage.svelte';
import DeploymentDetails from './lib/deployments/DeploymentDetails.svelte';
import DeploymentsList from './lib/deployments/DeploymentsList.svelte';
import CommandPalette from './lib/dialogs/CommandPalette.svelte';
import CustomPick from './lib/dialogs/CustomPick.svelte';
import MessageBox from './lib/dialogs/MessageBox.svelte';
import QuickPickInput from './lib/dialogs/QuickPickInput.svelte';
import DockerExtension from './lib/docker-extension/DockerExtension.svelte';
import ExtensionDetails from './lib/extensions/ExtensionDetails.svelte';
import ExtensionList from './lib/extensions/ExtensionList.svelte';
import SendFeedback from './lib/feedback/SendFeedback.svelte';
import HelpPage from './lib/help/HelpPage.svelte';
import BuildImageFromContainerfile from './lib/image/BuildImageFromContainerfile.svelte';
import ImageDetails from './lib/image/ImageDetails.svelte';
import ImagesList from './lib/image/ImagesList.svelte';
import ImportContainersImages from './lib/image/ImportContainersImages.svelte';
import LoadImages from './lib/image/LoadImages.svelte';
import PullImage from './lib/image/PullImage.svelte';
import RunImage from './lib/image/RunImage.svelte';
import SaveImages from './lib/image/SaveImages.svelte';
import IngressDetails from './lib/ingresses-routes/IngressDetails.svelte';
import IngressesRoutesList from './lib/ingresses-routes/IngressesRoutesList.svelte';
import RouteDetails from './lib/ingresses-routes/RouteDetails.svelte';
import KubePlayYAML from './lib/kube/KubePlayYAML.svelte';
import KubernetesEmptyPage from './lib/kube/KubernetesEmptyPage.svelte';
import ManifestDetails from './lib/manifest/ManifestDetails.svelte';
import NodeDetails from './lib/node/NodeDetails.svelte';
import NodesList from './lib/node/NodesList.svelte';
import Onboarding from './lib/onboarding/Onboarding.svelte';
import DeployPodToKube from './lib/pod/DeployPodToKube.svelte';
import PodCreateFromContainers from './lib/pod/PodCreateFromContainers.svelte';
import PodDetails from './lib/pod/PodDetails.svelte';
import PodsList from './lib/pod/PodsList.svelte';
import PreferencesPage from './lib/preferences/PreferencesPage.svelte';
import PVCDetails from './lib/pvc/PVCDetails.svelte';
import PVCList from './lib/pvc/PVCList.svelte';
import ServiceDetails from './lib/service/ServiceDetails.svelte';
import ServicesList from './lib/service/ServicesList.svelte';
import StatusBar from './lib/statusbar/StatusBar.svelte';
import IconsStyle from './lib/style/IconsStyle.svelte';
import TaskManager from './lib/task-manager/TaskManager.svelte';
import ToastHandler from './lib/toast/ToastHandler.svelte';
import TroubleshootingPage from './lib/troubleshooting/TroubleshootingPage.svelte';
import TitleBar from './lib/ui/TitleBar.svelte';
import CreateVolume from './lib/volume/CreateVolume.svelte';
import VolumeDetails from './lib/volume/VolumeDetails.svelte';
import VolumesList from './lib/volume/VolumesList.svelte';
import Webview from './lib/webview/Webview.svelte';
import WelcomePage from './lib/welcome/WelcomePage.svelte';
import PreferencesNavigation from './PreferencesNavigation.svelte';
import Route from './Route.svelte';
import { kubernetesCurrentContextState } from './stores/kubernetes-contexts-state';
import { navigationRegistry } from './stores/navigation/navigation-registry';
import SubmenuNavigation from './SubmenuNavigation.svelte';

router.mode.memory();

//remember from where we come to preference pages
let nonSettingsPage = '/';
router.subscribe(function (navigation) {
  if (navigation.url !== undefined && !navigation.url.startsWith('/preferences')) {
    nonSettingsPage = navigation.url;
  }
});

window.events?.receive('context-menu:visible', visible => {
  if (visible) {
    window.dispatchEvent(new Event('tooltip-hide'));
  } else {
    window.dispatchEvent(new Event('tooltip-show'));
  }
});

window.events?.receive('navigate', (navigationRequest: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleNavigation(navigationRequest as NavigationRequest<any>);
});
</script>

<Route path="/*" breadcrumb="Home" let:meta>
  <main class="flex flex-col w-screen h-screen overflow-hidden">
    <IconsStyle />
    <Appearance />
    <TitleBar />
    <ContextKey />

    <WelcomePage />

    <div class="flex flex-row w-full h-full overflow-hidden">
      <QuickPickInput />
      <CustomPick />
      <CommandPalette />
      <MessageBox />
      <AppNavigation meta={meta} exitSettingsCallback={() => router.goto(nonSettingsPage)} />
      {#if meta.url.startsWith('/preferences')}
        <PreferencesNavigation meta={meta} />
      {/if}
      {#each $navigationRegistry.filter(item => item.type === 'submenu') as navigationRegistryItem}
        {#if meta.url.startsWith(navigationRegistryItem.link) && navigationRegistryItem.items?.length}
          <SubmenuNavigation meta={meta} title={navigationRegistryItem.tooltip} items={navigationRegistryItem.items} />
        {/if}
      {/each}

      <div
        class="flex flex-col w-full h-full overflow-hidden"
        class:bg-[var(--pd-content-bg)]={!meta.url.startsWith('/preferences')}
        class:bg-[var(--pd-invert-content-bg)]={meta.url.startsWith('/preferences')}>
        <TaskManager />
        <SendFeedback />
        <ToastHandler />
        <Route path="/" breadcrumb="Dashboard Page">
          <DashboardPage />
        </Route>
        <Route path="/containers" breadcrumb="Containers" navigationHint="root">
          <ContainerList searchTerm={meta.query.filter || ''} />
        </Route>
        <Route path="/containers/:id/*" let:meta firstmatch>
          <Route path="/export" breadcrumb="Export Container">
            <ContainerExport containerID={meta.params.id} />
          </Route>
          <Route breadcrumb="Container Details" navigationHint="details" path="/*">
            <ContainerDetails containerID={meta.params.id} />
          </Route>
        </Route>

        <Route path="/kube/play" breadcrumb="Play Kubernetes YAML">
          <KubePlayYAML />
        </Route>
        <Route path="/image/run/*" breadcrumb="Run Image">
          <RunImage />
        </Route>
        <Route path="/images" breadcrumb="Images" navigationHint="root">
          <ImagesList />
        </Route>
        <Route path="/images/:id/:engineId" breadcrumb="Images" let:meta navigationHint="root">
          <ImagesList searchTerm={meta.params.id} imageEngineId={meta.params.engineId} />
        </Route>
        <Route
          path="/manifests/:id/:engineId/:base64RepoTag/*"
          breadcrumb="Manifest Details"
          let:meta
          navigationHint="details">
          <ManifestDetails
            imageID={meta.params.id}
            engineId={decodeURI(meta.params.engineId)}
            base64RepoTag={meta.params.base64RepoTag} />
        </Route>
        <Route
          path="/images/:id/:engineId/:base64RepoTag/*"
          breadcrumb="Image Details"
          let:meta
          navigationHint="details">
          <ImageDetails
            imageID={meta.params.id}
            engineId={decodeURI(meta.params.engineId)}
            base64RepoTag={meta.params.base64RepoTag} />
        </Route>
        <Route path="/images/build" breadcrumb="Build an Image">
          <BuildImageFromContainerfile />
        </Route>
        <Route path="/images/pull" breadcrumb="Pull an Image">
          <PullImage />
        </Route>
        <Route path="/images/import" breadcrumb="Import Containers">
          <ImportContainersImages />
        </Route>
        <Route path="/images/save" breadcrumb="Save Images">
          <SaveImages />
        </Route>
        <Route path="/images/load" breadcrumb="Load Images">
          <LoadImages />
        </Route>
        <Route path="/pods" breadcrumb="Pods" navigationHint="root">
          <PodsList />
        </Route>
        <Route path="/deploy-to-kube/:resourceId/:engineId/*" breadcrumb="Deploy to Kubernetes" let:meta>
          <DeployPodToKube
            resourceId={decodeURI(meta.params.resourceId)}
            engineId={decodeURI(meta.params.engineId)}
            type="container" />
        </Route>
        <!-- Same DeployPodToKube route, but instead we pass in the compose group name, then redirect to DeployPodToKube -->
        <Route path="/compose/deploy-to-kube/:composeGroupName/:engineId/*" breadcrumb="Deploy to Kubernetes" let:meta>
          <DeployPodToKube
            resourceId={decodeURI(meta.params.composeGroupName)}
            engineId={decodeURI(meta.params.engineId)}
            type="compose" />
        </Route>
        <Route path="/compose/details/:name/:engineId/*" breadcrumb="Compose Details" let:meta navigationHint="details">
          <ComposeDetails composeName={decodeURI(meta.params.name)} engineId={decodeURI(meta.params.engineId)} />
        </Route>
        <Route path="/pods/:kind/:name/:engineId/*" breadcrumb="Pod Details" let:meta navigationHint="details">
          <PodDetails
            podName={decodeURI(meta.params.name)}
            engineId={decodeURIComponent(meta.params.engineId)}
            kind={decodeURI(meta.params.kind)} />
        </Route>
        <Route path="/pod-create-from-containers" breadcrumb="Create Pod">
          <PodCreateFromContainers />
        </Route>
        <Route path="/volumes" breadcrumb="Volumes" navigationHint="root">
          <VolumesList />
        </Route>
        <Route path="/volumes/create" breadcrumb="Create a Volume">
          <CreateVolume />
        </Route>
        <Route path="/volumes/:name/:engineId/*" breadcrumb="Volume Details" let:meta navigationHint="details">
          <VolumeDetails volumeName={decodeURI(meta.params.name)} engineId={decodeURI(meta.params.engineId)} />
        </Route>
        {#if $kubernetesCurrentContextState.error === NO_CURRENT_CONTEXT_ERROR}
          <Route path="/kubernetes/*" breadcrumb="Kubernetes" navigationHint="root">
            <KubernetesEmptyPage />
          </Route>
        {:else}
          <!-- Redirect /kubernetes to nodes if we end up on /kubernetes without a context error 
           we use router.goto to preserve the navbar remembering the navigation location. 
           TODO: Remove after https://github.com/containers/podman-desktop/issues/8825 is implemented -->
          <Route path="/kubernetes" breadcrumb="Kubernetes" navigationHint="root">
            {router.goto('/kubernetes/nodes')}
          </Route>
          <Route path="/kubernetes/nodes" breadcrumb="Nodes" navigationHint="root">
            <NodesList />
          </Route>
          <Route path="/kubernetes/nodes/:name/*" breadcrumb="Node Details" let:meta navigationHint="details">
            <NodeDetails name={decodeURI(meta.params.name)} />
          </Route>
          <Route path="/kubernetes/persistentvolumeclaims" breadcrumb="Persistent Volume Claims" navigationHint="root">
            <PVCList />
          </Route>
          <Route
            path="/kubernetes/persistentvolumeclaims/:name/:namespace/*"
            breadcrumb="Persistent Volume Claim Details"
            let:meta
            navigationHint="details">
            <PVCDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
          </Route>
          <Route path="/kubernetes/deployments" breadcrumb="Deployments" navigationHint="root">
            <DeploymentsList />
          </Route>
          <Route
            path="/kubernetes/deployments/:name/:namespace/*"
            breadcrumb="Deployment Details"
            let:meta
            navigationHint="details">
            <DeploymentDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
          </Route>
          <Route path="/kubernetes/services" breadcrumb="Services" navigationHint="root">
            <ServicesList />
          </Route>
          <Route
            path="/kubernetes/services/:name/:namespace/*"
            breadcrumb="Service Details"
            let:meta
            navigationHint="details">
            <ServiceDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
          </Route>
          <Route path="/kubernetes/ingressesRoutes" breadcrumb="Ingresses & Routes" navigationHint="root">
            <IngressesRoutesList />
          </Route>
          <Route
            path="/kubernetes/ingressesRoutes/ingress/:name/:namespace/*"
            breadcrumb="Ingress Details"
            let:meta
            navigationHint="details">
            <IngressDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
          </Route>
          <Route path="/kubernetes/configmapsSecrets" breadcrumb="ConfigMaps & Secrets" navigationHint="root">
            <ConfigMapSecretList />
          </Route>
          <Route
            path="/kubernetes/configmapsSecrets/configmap/:name/:namespace/*"
            breadcrumb="ConfigMap Details"
            let:meta
            navigationHint="details">
            <ConfigMapDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
          </Route>
          <Route
            path="/kubernetes/configmapsSecrets/secret/:name/:namespace/*"
            breadcrumb="Secret Details"
            let:meta
            navigationHint="details">
            <SecretDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
          </Route>
          <Route
            path="/kubernetes/ingressesRoutes/route/:name/:namespace/*"
            breadcrumb="Route Details"
            let:meta
            navigationHint="details">
            <RouteDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
          </Route>
        {/if}
        <Route path="/preferences/*" breadcrumb="Settings">
          <PreferencesPage />
        </Route>

        <Route path="/global-onboarding" breadcrumb="Extension Onboarding" let:meta navigationHint="details">
          <Onboarding
            extensionIds={meta.query.ids ? decodeURIComponent(meta.query.ids).split(',') : []}
            global={true} />
        </Route>

        <Route path="/contribs/:name/*" breadcrumb="Extension" let:meta>
          <DockerExtension name={decodeURI(meta.params.name)} />
        </Route>
        <Route path="/webviews/:id/*" breadcrumb="Webview" let:meta>
          <Webview id={meta.params.id} />
        </Route>
        <Route path="/help" breadcrumb="Help">
          <HelpPage />
        </Route>
        <Route path="/troubleshooting/*" breadcrumb="Troubleshooting">
          <TroubleshootingPage />
        </Route>
        <Route path="/extensions" breadcrumb="Extensions" navigationHint="root">
          <ExtensionList />
        </Route>
        <Route path="/extensions/details/:id/*" breadcrumb="Extension Details" let:meta navigationHint="details">
          <ExtensionDetails extensionId={meta.params.id} />
        </Route>
      </div>
    </div>
    <StatusBar />
  </main>
</Route>
