<script lang="ts">
import ProviderInfo from '../ui/ProviderInfo.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let object: PodInfoUI;
</script>

<ProviderInfo provider={object.kind} context={object.engineId} />
