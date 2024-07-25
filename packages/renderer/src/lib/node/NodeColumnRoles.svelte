<script lang="ts">
import { faMicrochip, faSatelliteDish, faServer } from '@fortawesome/free-solid-svg-icons';
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
      return 'text-[var(--pd-status-running)]';
    case 'node':
      roleName = 'Node';
      // faServer: Better represents a "node" / server rack
      roleIcon = faServer;
      return 'text-[var(--pd-status-updated)]';
  }
}
</script>

<div class="flex flex-row gap-1">
  <Label name={roleName}>
    <Fa size="1x" icon={roleIcon} class={getConditionColour(object.role)} />
  </Label>
  {#if object.hasGpu}
    <Label name="GPU">
      <Fa size="1x" icon={faMicrochip} class="text-[var(--pd-status-updated)]" />
    </Label>
  {/if}
</div>
