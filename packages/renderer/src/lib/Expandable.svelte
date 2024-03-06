<script lang="ts">
import { fadeSlide } from './ui/animations';

export let title: string;
export let expanded: boolean = true;
</script>

<div>
  <button on:click="{() => (expanded = !expanded)}" class="">
    <div class="flex flex-row space-x-2 items-center">
      {#if expanded}
        <i class="fas fa-chevron-up"></i>
      {:else}
        <i class="fas fa-chevron-down"></i>
      {/if}
      <span>{title}</span>
    </div>
  </button>
</div>
{#if expanded}
  <div role="region" class="mt-5">
    <div transition:fadeSlide="{{ duration: 500 }}">
      <slot />
    </div>
  </div>
{/if}
