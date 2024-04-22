<script lang="ts">
import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCard from './InstalledExtensionCard.svelte';

export let extensionInfos: CombinedExtensionInfoUI[] = [];
</script>

<div class="grow p-4">
  {#each extensionInfos as extension}
    <InstalledExtensionCard extension="{extension}" />
  {/each}
</div>
