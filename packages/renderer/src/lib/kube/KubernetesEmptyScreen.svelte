<script lang='ts'>
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import KubernetesCheckConnection from '/@/lib/ui/KubernetesCheckConnection.svelte';

export let icon: any;
</script>

<EmptyScreen icon={icon} {...$$props}>
  <KubernetesCheckConnection />
</EmptyScreen>
