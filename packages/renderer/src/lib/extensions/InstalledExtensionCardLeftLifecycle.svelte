<script lang="ts">
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCardLeftLifecycleDelete from './InstalledExtensionCardLeftLifecycleDelete.svelte';
import InstalledExtensionCardLeftLifecycleStart from './InstalledExtensionCardLeftLifecycleStart.svelte';
import InstalledExtensionCardLeftLifecycleStop from './InstalledExtensionCardLeftLifecycleStop.svelte';

interface Props {
  extension: CombinedExtensionInfoUI;
}

let { extension }: Props = $props();
</script>

<div class="flex bg-[var(--pd-button-icon-bg)] w-fit rounded-lg" role="group" aria-label="Extension Actions">
  <InstalledExtensionCardLeftLifecycleStart extension={extension} />
  <InstalledExtensionCardLeftLifecycleStop extension={extension} />
  <InstalledExtensionCardLeftLifecycleDelete extension={extension} />
</div>
