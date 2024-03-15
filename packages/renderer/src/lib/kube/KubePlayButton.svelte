<script lang="ts">
import { router } from 'tinro';

import Button from '../ui/Button.svelte';
import KubePlayIcon from './KubePlayIcon.svelte';

function runContainerYaml(): void {
  router.goto('/kube/play');
}
</script>

<Button
  on:click="{() => runContainerYaml()}"
  title="Play pod/containers from kubernetes YAML file"
  icon="{KubePlayIcon}">
  Play Kubernetes YAML
</Button>
