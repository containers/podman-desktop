<script lang="ts">
import type { DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;
</script>

<div class="text-xs text-[var(--pd-table-body-text-highlight)]">
  {object.ready} / {object.replicas}
</div>
