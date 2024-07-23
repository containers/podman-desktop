<script lang="ts">
import ProviderInfo from '../ui/ProviderInfo.svelte';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';

export let object: ContainerInfoUI | ContainerGroupInfoUI;
</script>

<ProviderInfo provider={object.engineType} context={object.engineId} />
