<script lang="ts">
import { router } from 'tinro';
import KubePlayIcon from './KubePlayIcon.svelte';

function runContainerYaml(): void {
  router.goto('/kube/play');
}
</script>

<button
  on:click="{() => runContainerYaml()}"
  class="pf-c-button pf-m-primary"
  type="button"
  title="Play pod/containers from kubernetes YAML file ">
  <div class="flex flex-row align-text-top justify-start items-center">
    <KubePlayIcon />
    Play Kubernetes YAML
  </div>
</button>
