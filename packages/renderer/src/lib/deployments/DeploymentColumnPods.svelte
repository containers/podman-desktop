<script lang="ts">
import type { DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;
</script>

<div class="text-xs text-gray-500">
  {object.ready} / {object.replicas}
</div>
