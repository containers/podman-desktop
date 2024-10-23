<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import ServiceIcon from '../images/ServiceIcon.svelte';
import KubernetesCheckConnection from '../ui/KubernetesCheckConnection.svelte';
</script>

<EmptyScreen icon={ServiceIcon} title="No services" message="Try switching to a different context or namespace">
  <KubernetesCheckConnection />
</EmptyScreen>
