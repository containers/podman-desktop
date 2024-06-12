<script lang="ts">
import {
  faArrowDown,
  faArrowUp,
  faCheckCircle,
  faExclamationTriangle,
  faQuestionCircle,
  faSync,
  faTimesCircle,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import Label from '../ui/Label.svelte';
import type { DeploymentCondition, DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;

// Determine both the icon and color based on the deployment condition
function getConditionAttributes(condition: DeploymentCondition) {
  const defaults = {
    name: condition.type,
    color: 'text-gray-500',
    icon: faQuestionCircle,
  };

  // Condition map for easier lookup
  const conditionMap: { [key: string]: { name: string; color: string; icon?: IconDefinition } } = {
    'Available:MinimumReplicasAvailable': {
      name: 'Available',
      color: 'text-[var(--pd-status-running)]',
      icon: faCheckCircle,
    },
    'Available:MinimumReplicasUnavailable': {
      name: 'Unavailable',
      color: 'text-[var(--pd-status-degraded)]',
      icon: faTimesCircle,
    },
    'Progressing:ReplicaSetUpdated': {
      name: 'Updated',
      color: 'text-[var(--pd-status-updated)]',
    },
    'Progressing:NewReplicaSetCreated': {
      name: 'New Replica Set',
      color: 'text-[var(--pd-status-updated)]',
    },
    'Progressing:NewReplicaSetAvailable': {
      name: 'Progressed',
      color: 'text-[var(--pd-status-running)]',
      icon: faSync,
    },
    'Progressing:ReplicaSetScaledUp': {
      name: 'Scaled Up',
      color: 'text-[var(--pd-status-updated)]',
      icon: faArrowUp,
    },
    'Progressing:ReplicaSetScaledDown': {
      name: 'Scaled Down',
      color: 'text-[var(--pd-status-updated)]',
      icon: faArrowDown,
    },
    'Progressing:ProgressDeadlineExceeded': {
      name: 'Deadline Exceeded',
      color: 'text-[var(--pd-status-dead)]',
      icon: faTimesCircle,
    },
    'ReplicaFailure:ReplicaFailure': {
      name: 'Replica Failure',
      color: 'text-[var(--pd-status-dead)]',
      icon: faExclamationTriangle,
    },
  };

  // Construct the key from type and reason
  const key = `${condition.type}:${condition.reason}`;

  // Return the corresponding attributes or default if not found
  return conditionMap[key] || defaults;
}
</script>

<div class="flex flex-row gap-1">
  {#each object.conditions as condition}
    <Label tip="{condition.message}" name="{getConditionAttributes(condition).name}">
      <Fa
        size="1x"
        icon="{getConditionAttributes(condition).icon ?? faQuestionCircle}"
        class="{getConditionAttributes(condition).color}" />
    </Label>
  {/each}
</div>
