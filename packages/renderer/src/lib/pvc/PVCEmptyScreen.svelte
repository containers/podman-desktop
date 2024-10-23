<script lang="ts">
import PVCIcon from '../images/PVCIcon.svelte';
import KubernetesEmptyScreen from '../kube/KubernetesEmptyScreen.svelte';
</script>

<KubernetesEmptyScreen icon={PVCIcon} title="No PVCs" message="Try switching to a different context or namespace" />
