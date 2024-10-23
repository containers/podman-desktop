<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import IngressRouteIcon from '../images/IngressRouteIcon.svelte';
import KubernetesCheckConnection from '../ui/KubernetesCheckConnection.svelte';
</script>

<EmptyScreen
  icon={IngressRouteIcon}
  title="No ingresses or routes"
  message="Try switching to a different context or namespace">
  <KubernetesCheckConnection />
</EmptyScreen>

