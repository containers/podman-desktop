<script lang="ts">
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCardLeft from './InstalledExtensionCardLeft.svelte';
import InstalledExtensionCardRight from './InstalledExtensionCardRight.svelte';

export let extension: CombinedExtensionInfoUI;
</script>

<div
  class="bg-[color:var(--pd-card-bg)] mb-5 rounded-md p-3 divide-x divide-charcoal-500 flex"
  role="region"
  aria-label="{extension.id}">
  <!-- left col  -->
  <InstalledExtensionCardLeft extension="{extension}" />

  <div class="grow flex flex-wrap divide-gray-900 ml-2" role="region">
    <InstalledExtensionCardRight extension="{extension}" />
  </div>
</div>
