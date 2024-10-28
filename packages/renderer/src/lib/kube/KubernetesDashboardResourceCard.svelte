<script lang="ts">
import type { Component } from 'svelte';
import { router } from 'tinro';

interface Props {
  type: string;
  Icon: Component;
  count: number;
  link: string;
}

let { type, Icon, count, link }: Props = $props();

function openLink(): void {
  router.goto(link);
}
</script>

<button class="flex flex-col gap-4 p-4 bg-[var(--pd-content-card-carousel-card-bg)] hover:bg-[var(--pd-content-card-carousel-card-hover-bg)] rounded-md" onclick={openLink}>
  <div class="text-[var(--pd-invert-content-card-text)] font-semibold text-start">{type}</div>
  <div class="grid grid-cols-2 gap-4 w-full grow items-end">
    <div class="justify-self-center text-[var(--pd-button-primary-bg)]"><Icon size={40}/></div>
    <div class="flex flex-col">
      <span class="text-[var(--pd-invert-content-card-text)]">Total</span>
      <div class="text-2xl text-[var(--pd-invert-content-card-text)]" aria-label="{type} count">{count}</div>
    </div>
  </div>
</button>
