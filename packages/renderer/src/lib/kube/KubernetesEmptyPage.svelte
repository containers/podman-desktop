<script lang="ts">
import type { ProviderInfo } from '@desktop-framework/api';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { router } from 'tinro';

import EmbeddableCatalogExtensionList from '/@/lib/extensions/EmbeddableCatalogExtensionList.svelte';
import KubeIcon from '/@/lib/images/KubeIcon.svelte';
import Markdown from '/@/lib/markdown/Markdown.svelte';
import { providerInfos } from '/@/stores/providers';

async function createNew(provider: ProviderInfo): Promise<void> {
  await window.telemetryTrack('kubernetes.nocontext.createNew', {
    provider: provider.id,
  });
  router.goto(`/preferences/resources/provider/${provider.internalId}`);
}

async function oninstall(extensionId: string): Promise<void> {
  await window.telemetryTrack('kubernetes.nocontext.installExtension', {
    extension: extensionId,
  });
}

async function ondetails(extensionId: string): Promise<void> {
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

      {#each $providerInfos.filter(p => p.kubernetesProviderConnectionCreation) as provider (provider.id)}
        {@const label = `${provider.kubernetesProviderConnectionCreationButtonTitle ?? 'Create new'}`}
      <div class="rounded-xl p-5 text-left bg-[var(--pd-content-card-bg)] ">

        <div class="flex justify-left text-[var(--pd-details-empty-icon)] py-2 mb-2">
        {#if provider?.images?.icon}
          <Icon icon={provider.images.icon} class="mx-0 max-h-10" title={provider.name} />
        {/if}
        </div>
        <h1 class="text-lg font-semibold mb-4">
          {provider.kubernetesProviderConnectionCreationDisplayName ?? provider.name}
        </h1>
    
        <p class="text-sm text-[var(--pd-content-text)] mb-6">
        <Markdown markdown={provider.emptyConnectionMarkdownDescription} />
        </p>
    
        <div class="flex justify-center">
        <Button
          type="primary"
          on:click={(): Promise<void> => createNew(provider)}
          class="flex items-center"
          aria-label={label}
        >
          <Icon icon="{faPlusCircle}" size="1.2x" class="mr-1"/>
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
  </div>
</div>
