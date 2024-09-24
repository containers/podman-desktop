<script lang="ts">
import { Link } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import { providerInfos } from '../../stores/providers';
import EmbeddableCatalogExtensionList from '../extensions/EmbeddableCatalogExtensionList.svelte';
import KubeIcon from '../images/KubeIcon.svelte';
</script>

<div class="mt-8 flex justify-center overflow-auto">
  <div class="max-w-[800px] flex flex-col text-center space-y-3">
    <div class="flex justify-center text-[var(--pd-details-empty-icon)] py-2">
      <KubeIcon />
    </div>
    <h1 class="text-xl text-[var(--pd-details-empty-header)]">No Kubernetes cluster</h1>
    <div class="text-[var(--pd-details-empty-sub-header)] text-pretty">
      Deploy a Kubernetes cluster or connect to a remote one
    </div>

    <div class="w-full justify-center flex flex-row space-x-3">
      {#each $providerInfos.filter(p => p.kubernetesProviderConnectionCreation) as provider}
        {@const label = `${provider.kubernetesProviderConnectionCreationButtonTitle ?? 'Create new'} ${provider.kubernetesProviderConnectionCreationDisplayName ?? provider.name}...`}
        <Link onclick={() => router.goto(`/preferences/provider/${provider.internalId}`)} aria-label={label}>
          {label}
        </Link>
      {/each}
    </div>
    <EmbeddableCatalogExtensionList
      showEmptyScreen={false}
      title="Extensions to help you deploy Kubernetes clusters on your machine"
      category="Kubernetes"
      keywords={['provider', 'local']}
      showInstalled={false} />
    <EmbeddableCatalogExtensionList
      showEmptyScreen={false}
      title="Extensions to help you connect to remote Kubernetes clusters"
      category="Kubernetes"
      keywords={['provider', 'remote']}
      showInstalled={false} />
  </div>
</div>
