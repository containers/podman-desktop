<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import EmbeddableCatalogExtensionList from '../extensions/EmbeddableCatalogExtensionList.svelte';
import KubeIcon from '../images/KubeIcon.svelte';
</script>

<EmptyScreen
  icon={KubeIcon}
  title="No Kubernetes cluster"
  message="Deploy a Kubernetes cluster or connect to a remote one">
  <div class="max-w-[800px]">
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
</EmptyScreen>
