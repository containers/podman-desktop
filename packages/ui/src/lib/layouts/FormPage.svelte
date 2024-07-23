<script lang="ts">
import Page from './Page.svelte';

export let title: string;
export let inProgress = false;
export let breadcrumbLeftPart: string | undefined = undefined;
export let breadcrumbRightPart: string | undefined = undefined;
export let breadcrumbTitle: string | undefined = '';
export let onclose: () => void = () => {};
export let onbreadcrumbClick: () => void = () => {};
</script>

<Page
  title={title}
  breadcrumbLeftPart={breadcrumbLeftPart}
  breadcrumbRightPart={breadcrumbRightPart}
  breadcrumbTitle={breadcrumbTitle}
  inProgress={inProgress}
  onclose={onclose}
  onbreadcrumbClick={onbreadcrumbClick}>
  <svelte:fragment slot="icon">
    <slot name="icon" />
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <slot name="actions" />
  </svelte:fragment>
  <div slot="content" class="flex w-full h-full overflow-auto">
    <slot name="content" />
  </div>
</Page>
