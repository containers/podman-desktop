<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import EmbeddableCatalogExtensionList from '../extensions/EmbeddableCatalogExtensionList.svelte';
import KubeIcon from '../images/KubeIcon.svelte';
</script>

<EmptyScreen
  icon={KubeIcon}
  title="No Kubernetes cluster"
  message="Deploy a Kubernetes cluster or connect to a remote one">
  <div class="flex gap-2 justify-center max-w-[800px]">
    <EmbeddableCatalogExtensionList category="Kubernetes" showInstalled={false} />
  </div>
</EmptyScreen>
