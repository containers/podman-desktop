<script lang="ts">
import { faFileAlt, faKey } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import Label from '../ui/Label.svelte';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

export let object: ConfigMapSecretUI;

// Determine the icon and color based on the type
function getTypeAttributes(type: string) {
  const isConfigMap = type === 'ConfigMap';
  return {
    color: 'text-[var(--pd-status-running)]',
    icon: isConfigMap ? faFileAlt : faKey,
  };
}
</script>

<div class="flex flex-row gap-1">
  <Label name="{object.type}" capitalize="{false}">
    <Fa size="1x" icon="{getTypeAttributes(object.type).icon}" class="{getTypeAttributes(object.type).color}" />
  </Label>
</div>
