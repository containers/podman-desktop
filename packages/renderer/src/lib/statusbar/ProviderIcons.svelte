<script lang="ts">
import type { ProviderInfo } from '/@api/provider-info';

import IconImage from '../appearance/IconImage.svelte';
import DeveloperSandboxIconWhite from '../images/provider-icons/developer-sandbox-icon-white.svelte';
import KindWhiteIcon from '../images/provider-icons/kind-white-icon.svelte';
import MinikubeIconWhite from '../images/provider-icons/minikube-icon-white.svelte';
import PodmanIconWhite from '../images/provider-icons/podman-icon-white.svelte';
import RedHatOpenShiftWhite from '../images/provider-icons/Red_Hat-OpenShift-white.svelte';

export let entry: ProviderInfo;
</script>

{#if entry.name === 'Podman'}
  <PodmanIconWhite />
{:else if entry.name === 'OpenShift Local'}
  <RedHatOpenShiftWhite />
{:else if entry.name === 'Minikube'}
  <MinikubeIconWhite />
{:else if entry.name === 'Kind'}
  <KindWhiteIcon />
{:else if entry.name === 'Developer Sandbox'}
  <DeveloperSandboxIconWhite />
{:else if entry.images.icon}
  <IconImage image={entry.images.icon} class="h-3" alt={entry.name}></IconImage>
{/if}