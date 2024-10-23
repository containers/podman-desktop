<script lang="ts">
import IngressRouteIcon from '../images/IngressRouteIcon.svelte';
import KubernetesEmptyScreen from '../kube/KubernetesEmptyScreen.svelte';
</script>

<KubernetesEmptyScreen
  icon={IngressRouteIcon}
  title="No ingresses or routes"
  message="Try switching to a different context or namespace" />

