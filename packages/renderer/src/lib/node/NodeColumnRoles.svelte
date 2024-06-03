<script lang="ts">
import { faMicrochip, faSatelliteDish } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import Label from '../ui/Label.svelte';
import type { NodeUI } from './NodeUI';

export let object: NodeUI;

let roleName: string;
let roleIcon: any;

function getConditionColour(role: 'control-plane' | 'node'): string {
  switch (role) {
    case 'control-plane':
      roleName = 'Control Plane';
      // faSatelliteDish: Represents a satellite dish, suitable for the control plane role
      roleIcon = faSatelliteDish;
      return 'text-green-600';
    case 'node':
      roleName = 'Node';
      // faMicrochip: Represents a microchip or hardware similar to a "subset" of a satellite dish / control plane
      roleIcon = faMicrochip;
      return 'text-sky-400';
  }
}
</script>

<Label name="{roleName}">
  <Fa size="1x" icon="{roleIcon}" class="{getConditionColour(object.role)}" />
</Label>
