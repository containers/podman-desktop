<script lang="ts">
import './app.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import type { KubernetesNavigationRequest, NavigationRequest } from '@desktop-framework/api';
import { tablePersistence } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import { parseExtensionListRequest } from '/@/lib/extensions/extension-list';
import KubernetesRoot from '/@/lib/kube/KubernetesRoot.svelte';
import SecretCreate from '/@/lib/secrets/SecretCreate.svelte';
import SecretDetails from '/@/lib/secrets/SecretDetails.svelte';
import SecretsList from '/@/lib/secrets/SecretsList.svelte';
import PinActions from '/@/lib/statusbar/PinActions.svelte';
import { handleNavigation } from '/@/navigation';
import { kubernetesNoCurrentContext } from '/@/stores/kubernetes-no-current-context';

import AppNavigation from './AppNavigation.svelte';
import { navigateTo } from './kubernetesNavigation';
import Appearance from './lib/appearance/Appearance.svelte';
import ComposeDetails from './lib/compose/ComposeDetails.svelte';
import ConfigMapDetails from './lib/configmaps-secrets/ConfigMapDetails.svelte';
import ConfigMapSecretList from './lib/configmaps-secrets/ConfigMapSecretList.svelte';
import KubernetesSecretDetails from './lib/configmaps-secrets/SecretDetails.svelte';
import ContainerDetails from './lib/container/ContainerDetails.svelte';
import ContainerExport from './lib/container/ContainerExport.svelte';
import ContainerList from './lib/container/ContainerList.svelte';
import CreateContainerFromExistingImage from './lib/container/CreateContainerFromExistingImage.svelte';
import ContextKey from './lib/context/ContextKey.svelte';
import CronJobDetails from './lib/cronjob/CronJobDetails.svelte';
import CronJobList from './lib/cronjob/CronJobList.svelte';
import DashboardPage from './lib/dashboard/DashboardPage.svelte';
import DeploymentDetails from './lib/deployments/DeploymentDetails.svelte';
import DeploymentsList from './lib/deployments/DeploymentsList.svelte';
import CustomPick from './lib/dialogs/CustomPick.svelte';
import MessageBox from './lib/dialogs/MessageBox.svelte';
import QuickPickInput from './lib/dialogs/QuickPickInput.svelte';
import DockerExtension from './lib/docker-extension/DockerExtension.svelte';
import ExtensionDetails from './lib/extensions/ExtensionDetails.svelte';
import ExtensionList from './lib/extensions/ExtensionList.svelte';
import SendFeedback from './lib/feedback/SendFeedback.svelte';
import HelpActions from './lib/help/HelpActions.svelte';
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
import JobDetails from './lib/job/JobDetails.svelte';
import JobList from './lib/job/JobList.svelte';
import KubePlayYAML from './lib/kube/KubePlayYAML.svelte';
import KubernetesDashboard from './lib/kube/KubernetesDashboard.svelte';
import KubePodDetails from './lib/kube/pods/PodDetails.svelte';
import KubePodsList from './lib/kube/pods/PodsList.svelte';
import PortForwardingList from './lib/kubernetes-port-forward/PortForwardingList.svelte';
import ManifestDetails from './lib/manifest/ManifestDetails.svelte';
import CreateNetwork from './lib/network/CreateNetwork.svelte';
import NetworkDetails from './lib/network/NetworkDetails.svelte';
import NetworksList from './lib/network/NetworksList.svelte';
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
import { PodmanDesktopStoragePersist } from './lib/table/PodmanDesktopStoragePersist';
import TaskManager from './lib/task-manager/TaskManager.svelte';
import ToastHandler from './lib/toast/ToastHandler.svelte';
import ToastTaskNotifications from './lib/toast/ToastTaskNotifications.svelte';
import TroubleshootingPage from './lib/troubleshooting/TroubleshootingPage.svelte';
import TitleBar from './lib/ui/TitleBar.svelte';
import CreateVolume from './lib/volume/CreateVolume.svelte';
import VolumeDetails from './lib/volume/VolumeDetails.svelte';
import VolumesList from './lib/volume/VolumesList.svelte';
import Webview from './lib/webview/Webview.svelte';
import WelcomePage from './lib/welcome/WelcomePage.svelte';
import PreferencesNavigation from './PreferencesNavigation.svelte';
import Route from './Route.svelte';
import { navigationRegistry } from './stores/navigation/navigation-registry';
import SubmenuNavigation from './SubmenuNavigation.svelte';

router.mode.memory();

const LAST_ROUTE_KEY = 'last-route';
const SETTINGS_PAGE_KEY = 'settings-page';

let savedRoute: string | undefined = sessionStorage.getItem(LAST_ROUTE_KEY) ?? undefined;
let savedSettingsPage: string | undefined = sessionStorage.getItem(SETTINGS_PAGE_KEY) ?? undefined;

//remember from where we come to preference pages
let nonSettingsPage = savedRoute ?? '/';

// tinro fires router.subscribe synchronously with the current state on setup,
// and WelcomePage always calls router.goto('/') in its onMount (even on reload).
// We use that guaranteed '/' event as the trigger to restore the pre-reload
// route on top of Dashboard.  subscribeReady skips the synchronous initial
// fire so savedRoute is still available when the real '/' event arrives.
let subscribeReady = false;
router.subscribe(function (navigation) {
  if (!subscribeReady) return;
  if (navigation.url === undefined || navigation.url.includes('.html')) return;
  if (!navigation.url.startsWith('/')) return;

  if ((savedRoute !== undefined || savedSettingsPage !== undefined) && navigation.url === '/') {
    if (savedRoute) {
      router.goto(savedRoute);
      savedRoute = undefined;
    }
    if (savedSettingsPage) {
      router.goto(savedSettingsPage);
      savedSettingsPage = undefined;
    }
    return;
  }

  if (navigation.url === '/') {
    sessionStorage.removeItem(LAST_ROUTE_KEY);
    sessionStorage.removeItem(SETTINGS_PAGE_KEY);
    nonSettingsPage = '/';
  } else if (navigation.url.startsWith('/preferences')) {
    sessionStorage.setItem(SETTINGS_PAGE_KEY, navigation.url);
  } else {
    sessionStorage.setItem(LAST_ROUTE_KEY, navigation.url);
    sessionStorage.removeItem(SETTINGS_PAGE_KEY);
    nonSettingsPage = navigation.url;
  }
});
subscribeReady = true;

window.events?.receive('context-menu:visible', visible => {
  if (visible) {
    window.dispatchEvent(new Event('tooltip-hide'));
  } else {
    window.dispatchEvent(new Event('tooltip-show'));
  }
});

window.events?.receive('show-release-notes', () => {
  router.goto('/');
});

window.events?.receive('navigate', (navigationRequest: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleNavigation(navigationRequest as NavigationRequest<any>);
});

window.events?.receive('kubernetes-navigation', (args: unknown) => {
  navigateTo(args as KubernetesNavigationRequest);
});

// Initialize table persistence callbacks immediately
tablePersistence.storage = new PodmanDesktopStoragePersist();
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
      <MessageBox />
      <AppNavigation meta={meta} exitSettingsCallback={(): void => router.goto(nonSettingsPage)} />
      {#if meta.url.startsWith('/preferences')}
        <PreferencesNavigation meta={meta} />
      {/if}
      {#each $navigationRegistry.filter(item => item.type === 'submenu') as navigationRegistryItem, index (index)}
        {#if meta.url.startsWith(navigationRegistryItem.link) && navigationRegistryItem.items?.length}
          <SubmenuNavigation meta={meta} title={navigationRegistryItem.tooltip} link={navigationRegistryItem.link} items={navigationRegistryItem.items} />
        {/if}
      {/each}

      <div
        class="flex flex-col w-full min-w-0 h-full overflow-hidden"
        class:bg-[var(--pd-content-bg)]={!meta.url.startsWith('/preferences')}
        class:bg-[var(--pd-invert-content-bg)]={meta.url.startsWith('/preferences')}>
        <TaskManager />
        <SendFeedback />
        <ToastHandler />
        <ToastTaskNotifications />
        <Route path="/" breadcrumb="Dashboard Page" navigationHint="root">
          <DashboardPage />
        </Route>

        <Route path="/containers/*" breadcrumb="Containers" navigationHint="root" firstmatch>
          <Route path="/" breadcrumb="Containers" navigationHint="root">
            <ContainerList searchTerm={meta.query.filter ?? ''} />
          </Route>
          <Route path="/:id/*" let:meta firstmatch>
            <Route path="/export" breadcrumb="Export Container">
              <ContainerExport containerID={meta.params.id} />
            </Route>
            <Route breadcrumb="Container Details" navigationHint="details" path="/*">
              <ContainerDetails containerID={meta.params.id} />
            </Route>
          </Route>
        </Route>

        <Route path="/kube/play" breadcrumb="Podman kube play">
          <KubePlayYAML />
        </Route>

        <Route path="/images/*" breadcrumb="Images" navigationHint="root" firstmatch>
          <Route path="/" breadcrumb="Images" navigationHint="root">
            <ImagesList />
          </Route>
          <Route path="/existing-image-create-container" breadcrumb="Select image" >
            <CreateContainerFromExistingImage />
          </Route>
          <Route path="/build" breadcrumb="Build an Image" let:meta>
            <BuildImageFromContainerfile taskId={+meta.query.taskId}/>
          </Route>
          <Route path="/pull" breadcrumb="Pull an Image">
            <PullImage />
          </Route>
          <Route path="/import" breadcrumb="Import Containers">
            <ImportContainersImages />
          </Route>
          <Route path="/save" breadcrumb="Save Images">
            <SaveImages />
          </Route>
          <Route path="/load" breadcrumb="Load Images">
            <LoadImages />
          </Route>
          <Route path="/:id/:engineId" breadcrumb="Images" let:meta navigationHint="root">
            <ImagesList searchTerm={meta.params.id} imageEngineId={meta.params.engineId} />
          </Route>
          <Route
            path="/:id/:engineId/:base64RepoTag/*"
            let:meta
            firstmatch>
            <Route path="/run/*" breadcrumb="Run Image">
              <RunImage
                imageID={meta.params.id}
                engineId={decodeURI(meta.params.engineId)}
                base64RepoTag={meta.params.base64RepoTag}
              />
            </Route>
            <Route
              path="/*"
              breadcrumb="Image Details"
              navigationHint="details">
              <ImageDetails
                imageID={meta.params.id}
                engineId={decodeURI(meta.params.engineId)}
                base64RepoTag={meta.params.base64RepoTag} />
            </Route>
          </Route>
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

        <Route path="/networks/*" breadcrumb="Networks" navigationHint="root" firstmatch>
          <Route path="/" breadcrumb="Networks" navigationHint="root">
            <NetworksList />
          </Route>
          <Route path="/create/*" breadcrumb="Create a network">
            <CreateNetwork />
          </Route>
          <Route path="/:name/:engineId/*" breadcrumb="Network Details" let:meta navigationHint="details">
            <NetworkDetails networkName={decodeURIComponent(meta.params.name)} engineId={decodeURIComponent(meta.params.engineId)} />
          </Route>
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
        <Route path="/pods/podman/:name/:engineId/*" breadcrumb="Pod Details" let:meta navigationHint="details">
          <PodDetails
            podName={decodeURI(meta.params.name)}
            engineId={decodeURIComponent(meta.params.engineId)} />
        </Route>
        <Route path="/pod-create-from-containers" breadcrumb="Create Pod">
          <PodCreateFromContainers />
        </Route>

        <Route path="/volumes/*" breadcrumb="Volumes" navigationHint="root" firstmatch>
          <Route path="/" breadcrumb="Volumes" navigationHint="root">
            <VolumesList />
          </Route>
          <Route path="/create" breadcrumb="Create a Volume">
            <CreateVolume />
          </Route>
          <Route path="/:name/:engineId/*" breadcrumb="Volume Details" let:meta navigationHint="details">
            <VolumeDetails volumeName={decodeURI(meta.params.name)} engineId={decodeURI(meta.params.engineId)} />
          </Route>
        </Route>

        <!--- secrets -->
        <Route path="/secrets/*" breadcrumb="Secrets" navigationHint="root" firstmatch>
          <Route path="/" breadcrumb="Secrets" navigationHint="root">
            <SecretsList />
          </Route>
          <Route path="/create" breadcrumb="Create a secret">
            <SecretCreate />
          </Route>
          <Route path="/:engineId/:secretId/*" breadcrumb="Secret Details" let:meta navigationHint="details">
            <SecretDetails secretId={decodeURIComponent(meta.params.secretId)} engineId={decodeURIComponent(meta.params.engineId)} />
          </Route>
        </Route>
        {#if $kubernetesNoCurrentContext}
          <Route path="/kubernetes/*" breadcrumb="Kubernetes" navigationHint="root">
            <KubernetesDashboard />
          </Route>
        {:else}
         <Route path="/kubernetes" breadcrumb="Kubernetes" navigationHint="root">
            <KubernetesRoot />
          </Route>
          <Route path="/kubernetes/dashboard" breadcrumb="Dashboard" navigationHint="root">
            <KubernetesDashboard />
          </Route>
          <Route path="/kubernetes/nodes" breadcrumb="Nodes" navigationHint="root">
            <NodesList />
          </Route>
          <Route path="/kubernetes/nodes/:name/*" breadcrumb="Node Details" let:meta navigationHint="details">
            <NodeDetails name={decodeURI(meta.params.name)} />
          </Route>
          <Route path="/kubernetes/pods" breadcrumb="Pods" navigationHint="root">
            <KubePodsList />
          </Route>
          <Route
            path="/kubernetes/pods/:name/:namespace/*"
            breadcrumb="Pod Details"
            let:meta
            navigationHint="details">
            <KubePodDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
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
          <Route path="/kubernetes/jobs" breadcrumb="Jobs" navigationHint="root">
            <JobList />
          </Route>
          <Route path="/kubernetes/jobs/:name/:namespace/*" breadcrumb="Job Details" let:meta navigationHint="details">
            <JobDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
          </Route>
          <Route path="/kubernetes/cronjobs" breadcrumb="CronJobs" navigationHint="root">
            <CronJobList />
          </Route>
          <Route path="/kubernetes/cronjobs/:name/:namespace/*" breadcrumb="CronJob Details" let:meta navigationHint="details">
            <CronJobDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
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
            <KubernetesSecretDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
          </Route>
          <Route
            path="/kubernetes/ingressesRoutes/route/:name/:namespace/*"
            breadcrumb="Route Details"
            let:meta
            navigationHint="details">
            <RouteDetails name={decodeURI(meta.params.name)} namespace={decodeURI(meta.params.namespace)} />
          </Route>
          <Route path="/kubernetes/portForward" breadcrumb="Port Forwarding" navigationHint="root">
            <PortForwardingList />
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
        <Route path="/troubleshooting/*" breadcrumb="Troubleshooting">
          <TroubleshootingPage />
        </Route>

        <Route path="/extensions/*" breadcrumb="Extensions" navigationHint="root" firstmatch>
          <Route path="/" breadcrumb="Extensions" navigationHint="root" let:meta>
            {@const request = parseExtensionListRequest(meta)}
            <ExtensionList
              searchTerm={request.searchTerm}
              screen={request.screen}
            />
          </Route>
          <Route path="/details/:id/*" breadcrumb="Extension Details" let:meta navigationHint="details">
            <ExtensionDetails extensionId={meta.params.id} />
          </Route>
        </Route>
      </div>
    </div>
    <HelpActions/>
    <PinActions/>
    <StatusBar />
  </main>
</Route>
