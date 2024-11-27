<script lang="ts">
import { Button } from '@podman-desktop/ui-svelte';

import KubeApplyYamlButton from '/@/lib/kube/KubeApplyYAMLButton.svelte';
import { handleNavigation } from '/@/navigation';
import { NavigationPage } from '/@api/navigation-page';

function navigateToKubernetesResourceCreate(): void {
  return handleNavigation({ page: NavigationPage.KUBERNETES_RESOURCE_CREATE });
}
</script>

<KubeApplyYamlButton />
<Button title="Create Kubernetes Resource" on:click={navigateToKubernetesResourceCreate}>Create Resource</Button>

