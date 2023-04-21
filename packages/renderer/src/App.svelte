<script lang="ts">
import './app.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import './override.css';
import { router } from 'tinro';

import Route from './Route.svelte';
import ContainerList from './lib/ContainerList.svelte';
import { onMount } from 'svelte';
import ImagesList from './lib/ImagesList.svelte';
import ProviderList from './lib/ProviderList.svelte';
import Logo from './lib/images/Logo.svelte';
import PreferencesPage from './lib/preferences/PreferencesPage.svelte';
import BuildImageFromContainerfile from './lib/image/BuildImageFromContainerfile.svelte';
import PullImage from './lib/image/PullImage.svelte';
import DockerExtension from './lib/docker-extension/DockerExtension.svelte';
import ContainerDetails from './lib/container/ContainerDetails.svelte';
import { providerInfos } from './stores/providers';
import type { ProviderInfo } from '../../main/src/plugin/api/provider-info';
import WelcomePage from './lib/welcome/WelcomePage.svelte';
import DashboardPage from './lib/dashboard/DashboardPage.svelte';
import HelpPage from './lib/help/HelpPage.svelte';
import StatusBar from './lib/statusbar/StatusBar.svelte';
import ImageDetails from './lib/image/ImageDetails.svelte';
import PodsList from './lib/pod/PodsList.svelte';
import PreferencesNavigation from './PreferencesNavigation.svelte';
import AppNavigation from './AppNavigation.svelte';
import VolumesList from './lib/volume/VolumesList.svelte';
import VolumeDetails from './lib/volume/VolumeDetails.svelte';
import KubePlayYAML from './lib/kube/KubePlayYAML.svelte';
import PodDetails from './lib/pod/PodDetails.svelte';
import PodCreateFromContainers from './lib/pod/PodCreateFromContainers.svelte';
import DeployPodToKube from './lib/pod/DeployPodToKube.svelte';
import RunImage from './lib/image/RunImage.svelte';
import SendFeedback from './lib/feedback/SendFeedback.svelte';
import ToastHandler from './lib/toast/ToastHandler.svelte';
import QuickPickInput from './lib/dialogs/QuickPickInput.svelte';
import TaskManager from './lib/task-manager/TaskManager.svelte';
import MessageBox from './lib/dialogs/MessageBox.svelte';

router.mode.hash();

//remember from where we come to preference pages
let nonSettingsPage = '/';
router.subscribe(function (navigation) {
  if (navigation.url !== undefined && !navigation.url.startsWith('/preferences')) {
    nonSettingsPage = navigation.url;
  }
});

let providers: ProviderInfo[] = [];
$: providerConnections = providers
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

onMount(() => {
  providerInfos.subscribe(value => {
    providers = value;
  });
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.events?.receive('display-help', () => {
  router.goto('/help');
});
</script>

<Route path="/*" breadcrumb="Home" let:meta>
  <main class="min-h-screen flex flex-col h-screen bg-zinc-900">
    <header id="navbar" class="text-gray-400 bg-zinc-900 body-font" style="-webkit-app-region: drag;">
      <div class="flex mx-auto flex-row p-2 items-center">
        <div class="flex lg:w-2/5 flex-1 items-center text-base ml-auto"></div>
        <div
          class="flex order-none title-font font-medium items-center text-white align-middle justify-center mb-4 md:mb-0">
          <Logo />
          <span class="select-none ml-3 text-xl block text-gray-300">Podman Desktop</span>
        </div>
        <div class="lg:w-2/5 flex-1 lg:justify-end ml-5 lg:ml-0"></div>
      </div>
    </header>

    <WelcomePage />

    <div class="overflow-x-hidden flex flex-1">
      <AppNavigation meta="{meta}" exitSettingsCallback="{() => router.goto(nonSettingsPage)}" />
      {#if meta.url.startsWith('/preferences')}
        <PreferencesNavigation meta="{meta}" />
      {/if}

      <div
        class="z-0 w-full h-full flex flex-col overflow-y-scroll"
        class:bg-zinc-800="{!meta.url.startsWith('/preferences')}"
        class:bg-zinc-900="{meta.url.startsWith('/preferences')}">
        <TaskManager />
        <SendFeedback />
        <ToastHandler />
        <MessageBox />
        <QuickPickInput />
        <Route path="/" breadcrumb="Dashboard Page">
          <DashboardPage />
        </Route>
        <Route path="/containers" breadcrumb="Containers">
          <ContainerList searchTerm="{meta.query.filter || ''}" />
        </Route>
        <Route path="/containers/:id/*" breadcrumb="Container Details" let:meta>
          <ContainerDetails containerID="{meta.params.id}" />
        </Route>

        <Route path="/kube/play" breadcrumb="Play Pods or Containers from a Kubernetes YAML File">
          <KubePlayYAML />
        </Route>

        <Route path="/images" breadcrumb="Images">
          <ImagesList />
        </Route>
        <Route path="/images/:id/:engineId/:base64RepoTag/*" breadcrumb="Image Details" let:meta>
          <ImageDetails
            imageID="{meta.params.id}"
            engineId="{decodeURI(meta.params.engineId)}"
            base64RepoTag="{meta.params.base64RepoTag}" />
        </Route>
        <Route path="/images/build" breadcrumb="Build Image from Containerfile">
          <BuildImageFromContainerfile />
        </Route>
        <Route path="/images/run/*" breadcrumb="Create a container from image">
          <RunImage />
        </Route>
        <Route path="/images/pull" breadcrumb="Pull Image From a Registry">
          <PullImage />
        </Route>
        <Route path="/pods" breadcrumb="Pods">
          <PodsList />
        </Route>
        <Route
          path="/deploy-to-kube/:resourceId/:engineId/*"
          breadcrumb="Generated pod to deploy to Kubernetes"
          let:meta>
          <DeployPodToKube
            resourceId="{decodeURI(meta.params.resourceId)}"
            engineId="{decodeURI(meta.params.engineId)}" />
        </Route>
        <Route path="/pods/:kind/:name/:engineId/*" breadcrumb="Pod Details" let:meta>
          <PodDetails
            podName="{decodeURI(meta.params.name)}"
            engineId="{decodeURI(meta.params.engineId)}"
            kind="{decodeURI(meta.params.kind)}" />
        </Route>
        <Route path="/pod-create-from-containers" breadcrumb="Create a pod from containers">
          <PodCreateFromContainers />
        </Route>
        <Route path="/volumes" breadcrumb="Volumes">
          <VolumesList />
        </Route>
        <Route path="/volumes/:name/:engineId/*" breadcrumb="Volume Details" let:meta>
          <VolumeDetails volumeName="{decodeURI(meta.params.name)}" engineId="{decodeURI(meta.params.engineId)}" />
        </Route>
        <Route path="/providers" breadcrumb="Providers">
          <ProviderList />
        </Route>
        <Route path="/preferences/*" breadcrumb="Settings">
          <PreferencesPage />
        </Route>
        <Route path="/contribs/:name/*" breadcrumb="Extension" let:meta>
          <DockerExtension name="{decodeURI(meta.params.name)}" />
        </Route>
        <Route path="/help" breadcrumb="Help">
          <HelpPage />
        </Route>
      </div>
    </div>
    <StatusBar />
  </main>
</Route>
