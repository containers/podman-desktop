<script lang="ts">
import type { IConnectionStatus } from '../preferences/Util';

export let status: IConnectionStatus | undefined;
</script>

{#if status?.action && status?.error}
  <button
    aria-label="{status.action} failed"
    class="ml-3 text-[9px] text-red-500 underline"
    on:click={() => window.events?.send('toggle-task-manager', '')}>{status.action} failed</button>
{/if}
