<script lang="ts">
import { ContainerGroupInfoTypeUI } from '../container/ContainerInfoUI';
import { PodGroupInfoTypeUI } from '../pod/PodInfoUI';
import Label from './Label.svelte';
import ProviderInfoCircle from './ProviderInfoCircle.svelte';

// provider: name of the provider (e.g. podman, docker, kubernetes)
// context: only used for Kubernetes-like distros
let { provider = '', context = '' }: { provider?: string; context?: string } = $props();

// providerName: name of the provider in lowercase (e.g. podman, docker, kubernetes)
let providerName: 'docker' | 'podman' | 'kubernetes' | undefined = $state(undefined);

function getProviderName(providerName: string): 'docker' | 'podman' | 'kubernetes' | undefined {
  switch (providerName?.toLowerCase()) {
    case ContainerGroupInfoTypeUI.PODMAN:
      return 'podman';
    case ContainerGroupInfoTypeUI.DOCKER:
      return 'docker';
    case PodGroupInfoTypeUI.KUBERNETES:
      return 'kubernetes';
    default:
      return undefined;
  }
}

$effect(() => {
  providerName = getProviderName(provider);
});
</script>

<Label tip={provider === 'Kubernetes' ? context : ''} name={provider} capitalize>
  <ProviderInfoCircle type={providerName} />
</Label>
