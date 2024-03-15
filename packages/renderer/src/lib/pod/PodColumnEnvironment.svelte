<script lang="ts">
import ProviderInfo from '../ui/ProviderInfo.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let object: PodInfoUI;
</script>

<div class="text-xs rounded-md text-gray-500">
  <ProviderInfo provider="{object.kind}" context="{object.engineId}" />
</div>
