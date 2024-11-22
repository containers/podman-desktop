<script lang="ts">
import { providerColors } from './ProviderInfoCircle';

let { type }: { type: 'kubernetes' | 'podman' | 'docker' | undefined } = $props();
let color = $derived(providerColors[type ?? 'unknown']);

// Each provider has a colour associated to it within tailwind, this is a map of those colours.
// bg-purple-600 = podman
// bg-sky-300    = docker
// bg-sky-600    = kubernetes
// bg-gray-900   = unknown
</script>

<div aria-label="Provider info circle" class="w-2 h-2 {color} rounded-full"></div>
