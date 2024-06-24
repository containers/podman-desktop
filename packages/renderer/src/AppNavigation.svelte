<script lang="ts">
import { faCircleUser } from '@fortawesome/free-regular-svg-icons';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa';
import type { TinroRouteMeta } from 'tinro';

import Webviews from '/@/lib/webview/Webviews.svelte';
import { webviews } from '/@/stores/webviews';
import type { ImageInfo } from '/@api/image-info';

import { CommandRegistry } from './lib/CommandRegistry';
import NewContentOnDashboardBadge from './lib/dashboard/NewContentOnDashboardBadge.svelte';
import { ImageUtils } from './lib/image/image-utils';
import ConfigMapSecretIcon from './lib/images/ConfigMapSecretIcon.svelte';
import DashboardIcon from './lib/images/DashboardIcon.svelte';
import DeploymentIcon from './lib/images/DeploymentIcon.svelte';
import ExtensionIcon from './lib/images/ExtensionIcon.svelte';
import ImageIcon from './lib/images/ImageIcon.svelte';
import IngressRouteIcon from './lib/images/IngressRouteIcon.svelte';
import KubeIcon from './lib/images/KubeIcon.svelte';
import NodeIcon from './lib/images/NodeIcon.svelte';
import PodIcon from './lib/images/PodIcon.svelte';
import PuzzleIcon from './lib/images/PuzzleIcon.svelte';
import PVCIcon from './lib/images/PVCIcon.svelte';
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
  kubernetesCurrentContextConfigMaps,
  kubernetesCurrentContextDeployments,
  kubernetesCurrentContextIngresses,
  kubernetesCurrentContextNodes,
  kubernetesCurrentContextPersistentVolumeClaims,
  kubernetesCurrentContextRoutes,
  kubernetesCurrentContextSecrets,
  kubernetesCurrentContextServices,
} from './stores/kubernetes-contexts-state';
import { podsInfos } from './stores/pods';
import { volumeListInfos } from './stores/volumes';

let podInfoSubscribe: Unsubscriber;
let containerInfoSubscribe: Unsubscriber;
let imageInfoSubscribe: Unsubscriber;
let volumeInfoSubscribe: Unsubscriber;
let contextsSubscribe: Unsubscriber;
let nodesSubscribe: Unsubscriber;
let deploymentsSubscribe: Unsubscriber;
let persistentVolumeClaimsSubscribe: Unsubscriber;
let servicesSubscribe: Unsubscriber;
let ingressesSubscribe: Unsubscriber;
let routesSubscribe: Unsubscriber;
let configmapsSubscribe: Unsubscriber;
let secretsSubscribe: Unsubscriber;
let combinedInstalledExtensionsSubscribe: Unsubscriber;

let podCount = '';
let containerCount = '';
let imageCount = '';
let volumeCount = '';
let configmapsCount = 0;
let secretsCount = 0;
let configmapSecretsCount = '';
let persistentVolumeClaimsCount = '';
let contextCount = 0;
let deploymentCount = '';
let nodeCount = '';
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
  persistentVolumeClaimsSubscribe = kubernetesCurrentContextPersistentVolumeClaims.subscribe(value => {
    if (value.length > 0) {
      persistentVolumeClaimsCount = ' (' + value.length + ')';
    } else {
      persistentVolumeClaimsCount = '';
    }
  });
  nodesSubscribe = kubernetesCurrentContextNodes.subscribe(value => {
    if (value.length > 0) {
      nodeCount = ' (' + value.length + ')';
    } else {
      nodeCount = '';
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

  configmapsSubscribe = kubernetesCurrentContextConfigMaps.subscribe(value => {
    configmapsCount = value.length;
    updateConfigMapSecretsCount(configmapsCount + secretsCount);
  });
  secretsSubscribe = kubernetesCurrentContextSecrets.subscribe(value => {
    secretsCount = value.length;
    updateConfigMapSecretsCount(configmapsCount + secretsCount);
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
  if (nodesSubscribe) {
    nodesSubscribe();
  }
  if (deploymentsSubscribe) {
    deploymentsSubscribe();
  }
  if (persistentVolumeClaimsSubscribe) {
    persistentVolumeClaimsSubscribe();
  }
  if (servicesSubscribe) {
    servicesSubscribe();
  }
  if (configmapsSubscribe) {
    configmapsSubscribe();
  }
  if (secretsSubscribe) {
    secretsSubscribe();
  }
  ingressesSubscribe?.();
  routesSubscribe?.();
  configmapsSubscribe?.();
  secretsSubscribe?.();
  combinedInstalledExtensionsSubscribe?.();
});

function updateIngressesRoutesCount(count: number) {
  if (count > 0) {
    ingressesRoutesCount = ' (' + count + ')';
  } else {
    ingressesRoutesCount = '';
  }
}

function updateConfigMapSecretsCount(count: number) {
  if (count > 0) {
    configmapSecretsCount = ' (' + count + ')';
  } else {
    configmapSecretsCount = '';
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
      <NavItem href="/nodes" tooltip="Nodes{nodeCount}" ariaLabel="Nodes" bind:meta="{meta}">
        <NodeIcon size="{iconSize}" />
      </NavItem>
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
      <NavItem
        href="/configmapsSecrets"
        tooltip="ConfigMaps & Secrets{configmapSecretsCount}"
        ariaLabel="ConfigMaps & Secrets"
        bind:meta="{meta}">
        <ConfigMapSecretIcon size="{iconSize}" />
      </NavItem>
      <NavItem
        href="/persistentvolumeclaims"
        tooltip="Persistent Volume Claims{persistentVolumeClaimsCount}"
        ariaLabel="Persistent Volume Claims"
        bind:meta="{meta}">
        <PVCIcon size="{iconSize}" />
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
    <Fa class="h-6 w-6 fa-light" icon="{faCircleUser}" size="lg" style="fa-light" />
  </NavItem>

  <NavItem
    href="/preferences"
    tooltip="Settings"
    bind:meta="{meta}"
    onClick="{() => clickSettings(meta.url.startsWith('/preferences'))}">
    <SettingsIcon size="{iconSize}" />
  </NavItem>
</nav>
