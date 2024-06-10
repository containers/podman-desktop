<script lang="ts">
import { FormPage } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import { currentPage, lastPage } from '../../stores/breadcrumb';
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';

export let title: string;
export let showBreadcrumb = true;
export let inProgress = false;
export let contentLayout: 'default' | 'engine' = 'default';
export let showEmptyScreen: boolean = false;

export function goToPreviousPage(): void {
  router.goto($lastPage.path);
}
</script>

<FormPage
  title="{title}"
  showBreadcrumb="{showBreadcrumb}"
  inProgress="{inProgress}"
  breadcrumbLeftPart="{$lastPage.name}"
  breadcrumbRightPart="{$currentPage.name}"
  breadcrumbTitle="Go back to {$lastPage.name}"
  on:close="{goToPreviousPage}"
  on:breadcrumbClick="{goToPreviousPage}">
  <slot slot="icon" name="icon" />
  <slot slot="actions" name="actions" />
  <slot slot="tabs" name="tabs" />
  <slot slot="content">
    {#if contentLayout === 'engine'}
      <div class="p-5 min-w-full h-full">
        {#if showEmptyScreen}
          <NoContainerEngineEmptyScreen />
        {:else}
          <div class="bg-charcoal-900 px-6 py-4 space-y-2 sm:pb-6 lg:px-8 xl:pb-8 rounded-lg">
            <slot name="content" />
          </div>
        {/if}
      </div>
    {:else}
      <slot name="content" />
    {/if}
  </slot>
</FormPage>
