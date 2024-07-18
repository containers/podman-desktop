<script lang="ts">
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCardLeftLifecycleDelete from './InstalledExtensionCardLeftLifecycleDelete.svelte';
import InstalledExtensionCardLeftLifecycleStart from './InstalledExtensionCardLeftLifecycleStart.svelte';
import InstalledExtensionCardLeftLifecycleStop from './InstalledExtensionCardLeftLifecycleStop.svelte';

export let extension: CombinedExtensionInfoUI;
</script>

<div class="flex bg-[var(--pd-action-button-bg)] w-fit rounded-lg" role="group" aria-label="Extension Actions">
  <InstalledExtensionCardLeftLifecycleStart extension={extension} />
  <InstalledExtensionCardLeftLifecycleStop extension={extension} />
  <InstalledExtensionCardLeftLifecycleDelete extension={extension} />
</div>
