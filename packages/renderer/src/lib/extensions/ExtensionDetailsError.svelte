<script lang="ts">
import type { ExtensionDetailsUI } from './extension-details-ui';

export let extension: ExtensionDetailsUI;
</script>

{#if extension.error}
  <div class="flex flex-col text-[var(--pd-content-card-text)]">
    <div class="py-2">Error: {extension.error.message}</div>
    {#if extension.error.stack}
      <div class="text-xs">
        <div>Stack trace:</div>
        <pre role="group" aria-label="Stack Trace">{extension.error.stack}</pre>
      </div>
    {/if}
  </div>
{/if}
