<script lang="ts">
import EmptyScreen from '../ui/EmptyScreen.svelte';
import IngressRouteIcon from '../images/IngressRouteIcon.svelte';
</script>

<EmptyScreen
  icon="{IngressRouteIcon}"
  title="No ingresses or routes"
  message="Try switching to a different context or namespace" />
