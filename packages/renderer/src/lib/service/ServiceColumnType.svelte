<script lang="ts">
import type { ServiceUI } from './ServiceUI';

export let object: ServiceUI;

// Each type has a colour associated to it within tailwind, this is a map of those colours.
// bg-sky-500 = ClusterIP
// bg-purple-500 = LoadBalancer
// bg-fuschia-600 = NodePort
// bg-gray-900 = unknown
function getTypeColour(type: string): string {
  switch (type) {
    case 'ClusterIP':
      return 'bg-sky-500';
    case 'LoadBalancer':
      return 'bg-purple-500';
    case 'NodePort':
      return 'bg-fuschia-600';
    default:
      return 'bg-gray-600';
  }
}
</script>

<div class="flex flex-row bg-charcoal-500 items-center p-1 rounded-md text-xs text-gray-500">
  <div class="w-2 h-2 {getTypeColour(object.type)} rounded-full mr-1"></div>
  {object.type}
</div>
