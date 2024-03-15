<script lang="ts">
import DeploymentIcon from '../images/DeploymentIcon.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';
</script>

<EmptyScreen
  icon="{DeploymentIcon}"
  title="No deployments"
  message="Try switching to a different context or namespace" />
