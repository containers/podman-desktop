<script lang="ts">
import { router } from 'tinro';
import KubePlayIcon from './KubePlayIcon.svelte';
import Button from '../ui/Button.svelte';

function runContainerYaml(): void {
  router.goto('/kube/play');
}
</script>

<Button on:click="{() => runContainerYaml()}" title="Play pod/containers from kubernetes YAML file" type="primary">
  <KubePlayIcon slot="icon" />
  Play Kubernetes YAML
</Button>
