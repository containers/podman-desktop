<script lang="ts">
import { faBalanceScale, faNetworkWired, faPlug, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Fa } from 'svelte-fa';

import Label from '../ui/Label.svelte';
import type { ServiceUI } from './ServiceUI';

export let object: ServiceUI;

// Determine both the icon and color based on the service type
function getTypeAttributes(type: string) {
  switch (type) {
    case 'ClusterIP':
      // faNetworkWired: Represents internal network connections, suitable for ClusterIP
      return { color: 'text-sky-500', icon: faNetworkWired };
    case 'LoadBalancer':
      // faBalanceScale: Symbolizes distribution, fitting for LoadBalancer that distributes traffic
      return { color: 'text-purple-500', icon: faBalanceScale };
    case 'NodePort':
      // faPlug: Indicates a connection point, appropriate for NodePort which exposes services on each Node's IP
      return { color: 'text-fuschia-600', icon: faPlug };
    default:
      // faQuestionCircle: Used for unknown or unspecified types
      return { color: 'text-gray-600', icon: faQuestionCircle };
  }
}
</script>

<Label name={object.type}>
  <Fa size="1x" icon={getTypeAttributes(object.type).icon} class={getTypeAttributes(object.type).color} />
</Label>
