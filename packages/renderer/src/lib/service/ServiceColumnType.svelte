<script lang="ts">
import type { ServiceUI } from './ServiceUI';

export let object: ServiceUI;

// Each type has a colour associated to it within tailwind, this is a map of those colours.
// bg-green-600 = ClusterIP
// bg-sky-400 = LoadBalancer
// bg-amber-600 = NodePort
// bg-gray-900 = unknown
function getTypeColour(type: string): string {
  switch (type) {
    case 'ClusterIP':
      return 'bg-green-600';
    case 'LoadBalancer':
      return 'bg-sky-400';
    case 'NodePort':
      return 'bg-amber-600';
    default:
      return 'bg-gray-900';
  }
}
</script>

<div class="flex flex-row bg-charcoal-500 items-center p-1 rounded-md text-xs text-gray-500">
  <div class="w-2 h-2 {getTypeColour(object.type)} rounded-full mr-1"></div>
  {object.type}
</div>
