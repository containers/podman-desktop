<script lang="ts">
import type { PodInfoUI } from './PodInfoUI';
import ProviderInfo from '../ui/ProviderInfo.svelte';

export let object: PodInfoUI;
</script>

<div class="text-xs rounded-md text-gray-500">
  <ProviderInfo provider="{object.kind}" context="{object.engineId}" />
</div>
