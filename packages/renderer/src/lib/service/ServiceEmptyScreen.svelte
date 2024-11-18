<script lang="ts">
import ServiceIcon from '../images/ServiceIcon.svelte';
import KubernetesEmptyScreen from '../kube/KubernetesEmptyScreen.svelte';
</script>

<KubernetesEmptyScreen icon={ServiceIcon} title="No services" message="Try switching to a different context or namespace" />
