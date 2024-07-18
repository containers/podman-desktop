<script lang="ts">
import ProviderInfo from '../ui/ProviderInfo.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let object: ImageInfoUI;
</script>

<ProviderInfo provider={object.engineName} context={object.engineId} />
