<script lang="ts">
import FeaturedExtension from '/@/lib/featured/FeaturedExtension.svelte';
import { featuredExtensionInfos } from '/@/stores/featuredExtensions';
</script>

<!--Title-->
<p class="text-lg first-letter:uppercase font-bold">featured extensions:</p>
<div class="grid min-[920px]:grid-cols-2 min-[1180px]:grid-cols-3 gap-3" role="region" aria-label="FeaturedExtensions">
  {#each $featuredExtensionInfos as featuredExtension}
    <FeaturedExtension featuredExtension={featuredExtension} />
  {/each}
</div>
