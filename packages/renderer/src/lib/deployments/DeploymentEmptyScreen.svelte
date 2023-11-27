<script lang="ts">
import EmptyScreen from '../ui/EmptyScreen.svelte';
import DeploymentIcon from '../images/DeploymentIcon.svelte';
</script>

<EmptyScreen
  icon="{DeploymentIcon}"
  title="No deployments"
  message="Try switching to a different context or namespace" />
