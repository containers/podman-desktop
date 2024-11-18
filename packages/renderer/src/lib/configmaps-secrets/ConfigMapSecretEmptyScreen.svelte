<script lang="ts">
import ConfigMapSecretIcon from '../images/ConfigMapSecretIcon.svelte';
import KubernetesEmptyScreen from '../kube/KubernetesEmptyScreen.svelte';
</script>

<KubernetesEmptyScreen
  icon={ConfigMapSecretIcon}
  title="No configmaps or secrets"
  message="Try switching to a different context or namespace" />

