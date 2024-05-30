<script lang="ts">
import { faCheckCircle, faExclamationTriangle, faQuestionCircle, faSync } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

import type { DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;

// Determine both the icon and color based on the deployment condition
function getConditionAttributes(type: string) {
  switch (type) {
    case 'Available':
      // faCheckCircle: Indicates a successful state, typically used to denote availability and operational readiness
      return { color: 'text-green-600', icon: faCheckCircle };
    case 'Progressing':
      // faSync: Often used to represent ongoing processes or operations, fitting for a "Progressing" state
      return { color: 'text-sky-400', icon: faSync };
    case 'ReplicaFailure':
      // faExclamationTriangle: Alerts and warnings
      return { color: 'text-amber-600', icon: faExclamationTriangle };
    default:
      // faQuestionCircle: Uncertain / unknown
      return { color: 'text-gray-900', icon: faQuestionCircle };
  }
}
</script>

<div class="flex flex-row gap-1">
  {#each object.conditions as condition}
    <Tooltip bottom>
      <svelte:fragment slot="content">
        <div class="flex flex-row bg-charcoal-500 items-center p-1 rounded-md text-xs text-gray-500">
          <Fa
            size="1x"
            icon="{getConditionAttributes(condition.type).icon}"
            class="{getConditionAttributes(condition.type).color} mr-1" />
          {condition.type}
        </div>
      </svelte:fragment>
      <svelte:fragment slot="tip">
        {#if condition.message}
          <div class="inline-block py-2 px-4 rounded-md bg-charcoal-800 text-xs text-white" aria-label="tooltip">
            {condition.message}
          </div>
        {/if}
      </svelte:fragment>
    </Tooltip>
  {/each}
</div>
