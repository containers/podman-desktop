<script lang="ts">
import EmptyScreen from '../ui/EmptyScreen.svelte';
import ContainerIcon from '../images/ContainerIcon.svelte';
</script>

<EmptyScreen
  icon="{ContainerIcon}"
  title="No containers"
  message="Run a first container using the following command line:"
  commandline="podman run quay.io/podman/hello" />
