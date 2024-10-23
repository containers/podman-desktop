<script lang="ts">
import DeploymentIcon from '../images/DeploymentIcon.svelte';
import KubernetesEmptyScreen from '../kube/KubernetesEmptyScreen.svelte';
</script>

<KubernetesEmptyScreen icon={DeploymentIcon} title="No deployments" message="Try switching to a different context or namespace" />

