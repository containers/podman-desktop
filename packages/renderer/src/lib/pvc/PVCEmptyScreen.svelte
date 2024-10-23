<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import PVCIcon from '../images/PVCIcon.svelte';
import KubernetesCheckConnection from '../ui/KubernetesCheckConnection.svelte';
</script>

<EmptyScreen icon={PVCIcon} title="No PVCs" message="Try switching to a different context or namespace">
  <KubernetesCheckConnection />
</EmptyScreen>
