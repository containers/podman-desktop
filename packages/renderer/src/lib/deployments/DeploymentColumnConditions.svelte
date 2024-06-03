<script lang="ts">
import { faCheckCircle, faExclamationTriangle, faQuestionCircle, faSync } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

import type { DeploymentCondition, DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;

// Determine both the icon and color based on the deployment condition
function getConditionAttributes(condition: DeploymentCondition) {
  let name = condition.type;
  switch (condition.type) {
    case 'Available':
      // faCheckCircle: Indicates a successful state, typically used to denote availability and operational readiness
      return { color: 'text-green-600', icon: faCheckCircle, name };
    case 'Progressing':
      // faSync: Often used to represent ongoing processes or operations, fitting for a "Progressing" state
      // If reason has NewReplicaSetAvailable then it's progressed
      if (condition.reason === 'NewReplicaSetAvailable') {
        name = 'Progressed';
      }

      return { color: 'text-sky-400', icon: faSync, name };
    case 'ReplicaFailure':
      // faExclamationTriangle: Alerts and warnings
      return { color: 'text-amber-600', icon: faExclamationTriangle, name };
    default:
      // faQuestionCircle: Uncertain / unknown
      return { color: 'text-gray-900', icon: faQuestionCircle, name };
  }
}
</script>

<div class="flex flex-row gap-1">
  {#each object.conditions as condition}
    <Tooltip bottom tip="{condition.message}">
      <div class="flex flex-row bg-charcoal-500 items-center p-1 rounded-md text-xs text-gray-500">
        <Fa
          size="1x"
          icon="{getConditionAttributes(condition).icon}"
          class="{getConditionAttributes(condition).color} mr-1" />
        {getConditionAttributes(condition).name}
      </div>
    </Tooltip>
  {/each}
</div>
