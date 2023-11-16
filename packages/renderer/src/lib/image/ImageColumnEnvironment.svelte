<script lang="ts">
import ProviderInfo from '../ui/ProviderInfo.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let object: ImageInfoUI;
</script>

<div class="text-xs rounded-md text-gray-500">
  <ProviderInfo provider="{object.engineName}" context="{object.engineId}" />
</div>
