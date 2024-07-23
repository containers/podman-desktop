<script lang="ts">
import ProviderInfo from '../ui/ProviderInfo.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

export let object: VolumeInfoUI;
</script>

<ProviderInfo provider={object.engineName} context={object.engineId} />
