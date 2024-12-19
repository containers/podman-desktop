<script lang="ts">
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, Link } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';
import { router } from 'tinro';

import type { ProviderInfo } from '/@api/provider-info';

import { providerInfos } from '../../stores/providers';
import IconImage from '../appearance/IconImage.svelte';
import EmbeddableCatalogExtensionList from '../extensions/EmbeddableCatalogExtensionList.svelte';
import KubeIcon from '../images/KubeIcon.svelte';
import Markdown from '../markdown/Markdown.svelte';

const kubernetesExternalDocs = 'https://podman-desktop.io/docs/kubernetes';

async function createNew(provider: ProviderInfo) {
  await window.telemetryTrack('kubernetes.nocontext.createNew', {
    provider: provider.id,
  });
  router.goto(`/preferences/provider/${provider.internalId}`);
}

async function oninstall(extensionId: string) {
  await window.telemetryTrack('kubernetes.nocontext.installExtension', {
    extension: extensionId,
  });
}

async function ondetails(extensionId: string) {
  await window.telemetryTrack('kubernetes.nocontext.showExtensionDetails', {
    extension: extensionId,
  });
}
</script>

<div class="mt-8 flex justify-center overflow-auto">
  <div class="max-w-[800px] flex flex-col text-center space-y-3">
    <div class="flex justify-center text-[var(--pd-details-empty-icon)] py-2">
      <KubeIcon size="80" />
    </div>
    <h1 class="text-xl text-[var(--pd-details-empty-header)]">No Kubernetes cluster</h1>
    <div class="text-[var(--pd-details-empty-sub-header)] text-pretty">
      A Kubernetes cluster is a group of nodes (virtual or physical) that run Kubernetes, a system for automating the deployment and management of containerized applications.
    </div>
    <!-- Only show the text if there are providers with p.kubernetesProviderConnectionCreation -->
      {#if $providerInfos.some(p => p.kubernetesProviderConnectionCreation)}
    <div class="text-[var(--pd-details-empty-sub-header)] text-pretty">
      Deploy a Kubernetes cluster of your choice below:
    </div>
      {/if}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 justify-center">

      {#each $providerInfos.filter(p => p.kubernetesProviderConnectionCreation) as provider}
        {@const label = `${provider.kubernetesProviderConnectionCreationButtonTitle ?? 'Create new'}`}
      <div class="rounded-xl p-5 text-left bg-[var(--pd-content-card-bg)] ">

        <div class="flex justify-left text-[var(--pd-details-empty-icon)] py-2 mb-2">
        <IconImage image={provider?.images?.icon} class="mx-0 max-h-10" alt={provider.name}></IconImage>
        </div>
        <h1 class="text-lg font-semibold mb-4">
          {provider.kubernetesProviderConnectionCreationDisplayName ?? provider.name}
        </h1>
    
        <p class="text-sm text-gray-300 mb-6">
        <Markdown markdown={provider.emptyConnectionMarkdownDescription} />
        </p>
    
        <div class="flex justify-center">
        <Button
          type="primary"
          on:click={() => createNew(provider)}
          class="flex items-center"
          aria-label={label}
        >
          <Fa icon="{faPlusCircle}" size="1.2x" class="mr-1"/>
          {label}
        </Button>
        </div>
      </div>
      {/each}
    </div>
    
    <EmbeddableCatalogExtensionList
      oninstall={oninstall}
      ondetails={ondetails}
      showEmptyScreen={false}
      title="Extensions to help you deploy Kubernetes clusters on your machine or connect remotely to:"
      category="Kubernetes"
      keywords={['provider']}
      showInstalled={false} />

    <div class="text-[var(--pd-details-empty-sub-header)] text-pretty">
     Want to learn more about Kubernetes on Podman Desktop? <Link on:click={() => window.openExternal(kubernetesExternalDocs)}>Check out our documentation.</Link>
    </div>
  </div>
</div>
