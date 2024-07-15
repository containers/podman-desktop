<script lang="ts">
import type { DeploymentUI } from './DeploymentUI';

export let object: DeploymentUI;
</script>

<div class="text-[var(--pd-table-body-text)]">
  {object.ready} / {object.replicas}
</div>
