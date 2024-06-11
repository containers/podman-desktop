<script lang="ts">
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';
import FormPage from './FormPage.svelte';

export let title: string;
export let showBreadcrumb = true;
export let inProgress = false;
export let showEmptyScreen: boolean = false;
</script>

<FormPage title="{title}" showBreadcrumb="{showBreadcrumb}" inProgress="{inProgress}">
  <slot slot="icon" name="icon" />
  <slot slot="actions" name="actions" />
  <slot slot="tabs" name="tabs" />
  <slot slot="content">
    <div class="p-5 min-w-full h-full">
      {#if showEmptyScreen}
        <NoContainerEngineEmptyScreen />
      {:else}
        <div class="bg-charcoal-900 px-6 py-4 space-y-2 sm:pb-6 lg:px-8 xl:pb-8 rounded-lg">
          <slot name="content" />
        </div>
      {/if}
    </div>
  </slot>
</FormPage>
