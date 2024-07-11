<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

export let pagePath: string;
export let show: boolean = false;
export let onHide: () => void = () => {};

let isInPage = $router.path === pagePath;
let hasNew: boolean;
$: hasNew = !isInPage && show;

let routerUnsubscribe: Unsubscriber;

onMount(() => {
  // listen to router change, so we can reset the changes and update the dot visibility
  routerUnsubscribe = router.subscribe(route => {
    isInPage = route.path === pagePath;
    if (isInPage) {
      onHide();
    }
  });
});

onDestroy(() => {
  routerUnsubscribe?.();
});
</script>

{#if hasNew}
  <div aria-label="New content available" class="w-[6px] h-[6px] bg-[var(--pd-notification-dot)] rounded-full"></div>
{/if}
