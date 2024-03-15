<script lang="ts">
import IngressRouteIcon from '../images/IngressRouteIcon.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';
</script>

<EmptyScreen
  icon="{IngressRouteIcon}"
  title="No ingresses or routes"
  message="Try switching to a different context or namespace" />
