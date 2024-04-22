<script lang="ts">
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa';
import type { TinroRouteMeta } from 'tinro';

import Webviews from '/@/lib/webview/Webviews.svelte';
import { webviews } from '/@/stores/webviews';

import type { ImageInfo } from '../../main/src/plugin/api/image-info';
import { CommandRegistry } from './lib/CommandRegistry';
import NewContentOnDashboardBadge from './lib/dashboard/NewContentOnDashboardBadge.svelte';
import { ImageUtils } from './lib/image/image-utils';
import ContainerIcon from './lib/images/ContainerIcon.svelte';
import DashboardIcon from './lib/images/DashboardIcon.svelte';
import DeploymentIcon from './lib/images/DeploymentIcon.svelte';
import ExtensionIcon from './lib/images/ExtensionIcon.svelte';
import ImageIcon from './lib/images/ImageIcon.svelte';
import IngressRouteIcon from './lib/images/IngressRouteIcon.svelte';
import KubeIcon from './lib/images/KubeIcon.svelte';
import PodIcon from './lib/images/PodIcon.svelte';
import PuzzleIcon from './lib/images/PuzzleIcon.svelte';
import ServiceIcon from './lib/images/ServiceIcon.svelte';
import SettingsIcon from './lib/images/SettingsIcon.svelte';
import VolumeIcon from './lib/images/VolumeIcon.svelte';
import NavItem from './lib/ui/NavItem.svelte';
import NavSection from './lib/ui/NavSection.svelte';
import { combinedInstalledExtensions } from './stores/all-installed-extensions';
import { containersInfos } from './stores/containers';
import { contributions } from './stores/contribs';
import { imagesInfos } from './stores/images';
import { kubernetesContexts } from './stores/kubernetes-contexts';
import {
  kubernetesCurrentContextDeployments,
  kubernetesCurrentContextIngresses,
  kubernetesCurrentContextRoutes,
  kubernetesCurrentContextServices,
} from './stores/kubernetes-contexts-state';
import { podsInfos } from './stores/pods';
import { volumeListInfos } from './stores/volumes';

let podInfoSubscribe: Unsubscriber;
let containerInfoSubscribe: Unsubscriber;
let imageInfoSubscribe: Unsubscriber;
let volumeInfoSubscribe: Unsubscriber;
let contextsSubscribe: Unsubscriber;
let deploymentsSubscribe: Unsubscriber;
let servicesSubscribe: Unsubscriber;
let ingressesSubscribe: Unsubscriber;
let routesSubscribe: Unsubscriber;
let combinedInstalledExtensionsSubscribe: Unsubscriber;

let podCount = '';
let containerCount = '';
let imageCount = '';
let volumeCount = '';
let contextCount = 0;
let deploymentCount = '';
let serviceCount = '';
let ingressesCount = 0;
let routesCount = 0;
let ingressesRoutesCount = '';
let extensionCount = '';

const imageUtils = new ImageUtils();
export let exitSettingsCallback: () => void;

const iconSize = '22';

onMount(async () => {
  const commandRegistry = new CommandRegistry();
  commandRegistry.init();
  podInfoSubscribe = podsInfos.subscribe(value => {
    if (value.length > 0) {
      podCount = ' (' + value.length + ')';
    } else {
      podCount = '';
    }
  });
  containerInfoSubscribe = containersInfos.subscribe(value => {
    if (value.length > 0) {
      containerCount = ' (' + value.length + ')';
    } else {
      containerCount = '';
    }
  });
  imageInfoSubscribe = imagesInfos.subscribe(value => {
    let images = value.map((imageInfo: ImageInfo) => imageUtils.getImagesInfoUI(imageInfo, [], undefined, [])).flat();
    if (images.length > 0) {
      imageCount = ' (' + images.length + ')';
    } else {
      imageCount = '';
    }
  });
  volumeInfoSubscribe = volumeListInfos.subscribe(value => {
    let flattenedVolumes = value.map(volumeInfo => volumeInfo.Volumes).flat();
    if (flattenedVolumes.length > 0) {
      volumeCount = ' (' + flattenedVolumes.length + ')';
    } else {
      volumeCount = '';
    }
  });
  deploymentsSubscribe = kubernetesCurrentContextDeployments.subscribe(value => {
    if (value.length > 0) {
      deploymentCount = ' (' + value.length + ')';
    } else {
      deploymentCount = '';
    }
  });
  servicesSubscribe = kubernetesCurrentContextServices.subscribe(value => {
    if (value.length > 0) {
      serviceCount = ' (' + value.length + ')';
    } else {
      serviceCount = '';
    }
  });
  ingressesSubscribe = kubernetesCurrentContextIngresses.subscribe(value => {
    ingressesCount = value.length;
    updateIngressesRoutesCount(ingressesCount + routesCount);
  });
  routesSubscribe = kubernetesCurrentContextRoutes.subscribe(value => {
    routesCount = value.length;
    updateIngressesRoutesCount(ingressesCount + routesCount);
  });
  contextsSubscribe = kubernetesContexts.subscribe(value => {
    contextCount = value.length;
  });
  combinedInstalledExtensionsSubscribe = combinedInstalledExtensions.subscribe(value => {
    if (value.length > 0) {
      extensionCount = ` (${value.length})`;
    } else {
      extensionCount = '';
    }
  });
});

onDestroy(() => {
  if (podInfoSubscribe) {
    podInfoSubscribe();
  }
  if (containerInfoSubscribe) {
    containerInfoSubscribe();
  }
  if (imageInfoSubscribe) {
    imageInfoSubscribe();
  }
  if (volumeInfoSubscribe) {
    volumeInfoSubscribe();
  }
  if (contextsSubscribe) {
    contextsSubscribe();
  }
  if (deploymentsSubscribe) {
    deploymentsSubscribe();
  }
  if (servicesSubscribe) {
    servicesSubscribe();
  }
  ingressesSubscribe?.();
  routesSubscribe?.();
  combinedInstalledExtensionsSubscribe?.();
});

function updateIngressesRoutesCount(count: number) {
  if (count > 0) {
    ingressesRoutesCount = ' (' + count + ')';
  } else {
    ingressesRoutesCount = '';
  }
}

function clickSettings(b: boolean) {
  if (b) {
    exitSettingsCallback();
  } else {
    window.location.href = '#/preferences/resources';
  }
}

export let meta: TinroRouteMeta;
</script>

<svelte:window />
<nav
  class="group w-leftnavbar min-w-leftnavbar flex flex-col hover:overflow-y-none bg-[var(--pd-global-nav-bg)]"
  aria-label="AppNavigation">
  <NavItem href="/" tooltip="Dashboard" bind:meta="{meta}">
    <div class="relative w-full">
      <div class="flex items-center w-full h-full">
        <DashboardIcon size="{iconSize}" />
      </div>
      <NewContentOnDashboardBadge />
    </div>
  </NavItem>
  <NavItem href="/containers" tooltip="Containers{containerCount}" ariaLabel="Containers" bind:meta="{meta}">
    <ContainerIcon size="{iconSize}" />
  </NavItem>
  <NavItem href="/pods" tooltip="Pods{podCount}" ariaLabel="Pods" bind:meta="{meta}">
    <PodIcon size="{iconSize}" />
  </NavItem>
  <NavItem href="/images" tooltip="Images{imageCount}" ariaLabel="Images" bind:meta="{meta}">
    <ImageIcon size="{iconSize}" />
  </NavItem>
  <NavItem href="/volumes" tooltip="Volumes{volumeCount}" ariaLabel="Volumes" bind:meta="{meta}">
    <VolumeIcon size="{iconSize}" />
  </NavItem>
  <NavItem href="/extensions" tooltip="Extensions{extensionCount}" ariaLabel="Extensions" bind:meta="{meta}">
    <ExtensionIcon size="24" />
  </NavItem>
  {#if contextCount > 0}
    <NavSection tooltip="Kubernetes">
      <KubeIcon size="{iconSize}" slot="icon" />
      <NavItem href="/deployments" tooltip="Deployments{deploymentCount}" ariaLabel="Deployments" bind:meta="{meta}">
        <DeploymentIcon size="{iconSize}" />
      </NavItem>
      <NavItem href="/services" tooltip="Services{serviceCount}" ariaLabel="Services" bind:meta="{meta}">
        <ServiceIcon size="{iconSize}" />
      </NavItem>
      <NavItem
        href="/ingressesRoutes"
        tooltip="Ingresses & Routes{ingressesRoutesCount}"
        ariaLabel="Ingresses & Routes"
        bind:meta="{meta}">
        <IngressRouteIcon size="{iconSize}" />
      </NavItem>
    </NavSection>
  {/if}

  {#if $contributions.length + $webviews.length > 0}
    <NavSection tooltip="Extensions">
      <PuzzleIcon size="{iconSize}" slot="icon" />
      {#each $contributions as contribution (contribution.extensionId + contribution.id)}
        <NavItem href="/contribs/{contribution.name}" tooltip="{contribution.name}" bind:meta="{meta}">
          <img src="{contribution.icon}" width="{iconSize}" height="{iconSize}" alt="{contribution.name}" />
        </NavItem>
      {/each}

      <Webviews bind:meta="{meta}" />
    </NavSection>
  {/if}

  <div class="grow"></div>

  <NavItem
    href="/accounts"
    tooltip="Accounts"
    bind:meta="{meta}"
    onClick="{event => window.showAccountsMenu(event.x, event.y)}">
    <Fa class="ml-[-3px] h-6 w-6 fa-light" icon="{faCircleUser}" size="lg" style="fa-light" />
  </NavItem>

  <NavItem
    href="/preferences"
    tooltip="Settings"
    bind:meta="{meta}"
    onClick="{() => clickSettings(meta.url.startsWith('/preferences'))}">
    <SettingsIcon size="{iconSize}" />
  </NavItem>
</nav>
