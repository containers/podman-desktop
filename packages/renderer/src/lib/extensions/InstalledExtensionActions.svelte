<script lang="ts">
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCardLeftLifecycle from './InstalledExtensionCardLeftLifecycle.svelte';
import InstalledExtensionCardLeftOnboardingAndProperties from './InstalledExtensionCardLeftOnboardingAndProperties.svelte';

export let extension: CombinedExtensionInfoUI;
</script>

<div class="text-center flex-row flex {$$props.class}">
  <InstalledExtensionCardLeftLifecycle extension={extension} />
  <InstalledExtensionCardLeftOnboardingAndProperties extension={extension} />
</div>
