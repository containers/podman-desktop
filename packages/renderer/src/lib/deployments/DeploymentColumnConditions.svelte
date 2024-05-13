<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';

import type { DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;

// Each condition has a colour associated to it within tailwind, this is a map of those colours.
// bg-green-600 = Available
// bg-sky-400 = Progressing
// bg-amber-600 = ReplicaFailure
// bg-gray-900 = unknown
function getConditionColour(type: string): string {
  switch (type) {
    case 'Available':
      return 'bg-green-600';
    case 'Progressing':
      return 'bg-sky-400';
    case 'ReplicaFailure':
      return 'bg-amber-600';
    default:
      return 'bg-gray-900';
  }
}
</script>

<div class="flex flex-row gap-1">
  {#each object.conditions as condition}
    <Tooltip bottom>
      <svelte:fragment slot="item">
        <div class="flex flex-row bg-charcoal-500 items-center p-1 rounded-md text-xs text-gray-500">
          <div class="w-2 h-2 {getConditionColour(condition.type)} rounded-full mr-1"></div>
          {condition.type}
        </div>
      </svelte:fragment>
      <svelte:fragment slot="tip">
        <div class="inline-block py-2 px-4 rounded-md bg-charcoal-800 text-xs text-white" aria-label="tooltip">
          {condition.message}
        </div>
      </svelte:fragment>
    </Tooltip>
  {/each}
</div>
