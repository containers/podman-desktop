<script lang="ts">
import 'ninja-keys';
import './app.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import './override.css';
import { Route, router } from 'tinro';

import ContainerList from './lib/ContainerList.svelte';
import { onMount } from 'svelte';
import ExtensionList from './lib/ExtensionList.svelte';
import ImagesList from './lib/ImagesList.svelte';
import ProviderList from './lib/ProviderList.svelte';
import Logo from './lib/logo/Logo.svelte';
import PreferencesPage from './lib/preferences/PreferencesPage.svelte';
import BuildImageFromContainerfile from './lib/image/BuildImageFromContainerfile.svelte';
import PullImage from './lib/image/PullImage.svelte';
import DockerExtension from './lib/docker-extension/DockerExtension.svelte';
import ContainerDetails from './lib/ContainerDetails.svelte';
import { providerInfos } from './stores/providers';
import type { ProviderInfo } from '../../main/src/plugin/api/provider-info';
import WelcomePage from './lib/welcome/WelcomePage.svelte';
import HelpPage from './lib/help/HelpPage.svelte';
import StatusBar from './lib/statusbar/StatusBar.svelte';
import ImageDetails from './lib/image/ImageDetails.svelte';
import PodsList from './lib/pod/PodsList.svelte';
import PreferencesNavigation from './PreferencesNavigation.svelte';
import AppNavigation from './AppNavigation.svelte';
import VolumesList from './lib/volume/VolumesList.svelte';
import VolumeDetails from './lib/volume/VolumeDetails.svelte';
import ContainerPlayKubefile from './lib/container/ContainerPlayKubefile.svelte';
import PodDetails from './lib/pod/PodDetails.svelte';

router.mode.hash();

//remember from where we come to preference pages
let nonSettingsPage = '/';
router.subscribe(function (navigation) {
  if (navigation.from !== undefined && !navigation.from.startsWith('/preferences')) {
    nonSettingsPage = navigation.from;
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
    <ninja-keys id="command-palette" placeholder="" openHotkey="F1" hideBreadcrumbs class="dark"></ninja-keys>

    <header id="navbar" class="text-gray-400 bg-zinc-900 body-font" style="-webkit-app-region: drag;">
      <div class="flex mx-auto flex-row p-2 items-center">
        <div class="flex lg:w-2/5 flex-1 items-center text-base ml-auto"></div>
        <div
          class="flex order-none title-font font-medium items-center text-white align-middle justify-center mb-4 md:mb-0">
          <Logo />
          <span class="ml-3 text-xl block text-gray-300">Podman Desktop</span>
        </div>
        <div class="lg:w-2/5 flex-1 lg:justify-end ml-5 lg:ml-0"></div>
      </div>
    </header>

    <div class="overflow-x-hidden flex flex-1">
      {#if meta.url.startsWith('/preferences')}
        <PreferencesNavigation meta="{meta}" exitSettingsCallback="{() => router.goto(nonSettingsPage)}" />
      {:else}
        <AppNavigation meta="{meta}" />
      {/if}

      <div class="w-full h-full bg-zinc-800 flex flex-col overflow-y-scroll">
        <Route path="/">
          <WelcomePage />
        </Route>
        <Route path="/containers">
          <ContainerList searchTerm="{meta.query.filter || ''}" />
        </Route>
        <Route path="/containers/:id/*" let:meta>
          <ContainerDetails containerID="{meta.params.id}" />
        </Route>
        <Route path="/containers/play">
          <ContainerPlayKubefile />
        </Route>

        <Route path="/images">
          <ImagesList />
        </Route>
        <Route path="/images/:id/:engineId/:base64RepoTag/*" let:meta>
          <ImageDetails
            imageID="{meta.params.id}"
            engineId="{decodeURI(meta.params.engineId)}"
            base64RepoTag="{meta.params.base64RepoTag}" />
        </Route>
        <Route path="/images/build">
          <BuildImageFromContainerfile />
        </Route>
        <Route path="/images/pull">
          <PullImage />
        </Route>
        <Route path="/pods">
          <PodsList />
        </Route>
        <Route path="/pods/:name/:engineId/*" let:meta>
          <PodDetails podName="{decodeURI(meta.params.name)}" engineId="{decodeURI(meta.params.engineId)}" />
        </Route>
        <Route path="/volumes">
          <VolumesList />
        </Route>
        <Route path="/volumes/:name/:engineId/*" let:meta>
          <VolumeDetails volumeName="{decodeURI(meta.params.name)}" engineId="{decodeURI(meta.params.engineId)}" />
        </Route>

        <Route path="/extensions">
          <ExtensionList />
        </Route>
        <Route path="/providers">
          <ProviderList />
        </Route>
        <Route path="/preferences/*">
          <PreferencesPage />
        </Route>
        <Route path="/contribs/:name" let:meta>
          <DockerExtension name="{decodeURI(meta.params.name)}" />
        </Route>
        <Route path="/help">
          <HelpPage />
        </Route>
      </div>
    </div>
    <StatusBar />
  </main>
</Route>
