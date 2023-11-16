<script lang="ts">
import ProviderInfo from '../ui/ProviderInfo.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

export let object: VolumeInfoUI;
</script>

<div class="text-xs rounded-md text-gray-500">
  <ProviderInfo provider="{object.engineName}" context="{object.engineId}" />
</div>
