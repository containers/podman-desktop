<script lang="ts">
import Page from './Page.svelte';

export let title: string;
export let titleDetail: string | undefined = undefined;
export let subtitle: string | undefined = undefined;
export let breadcrumbLeftPart: string | undefined = undefined;
export let breadcrumbRightPart: string | undefined = undefined;
export let breadcrumbTitle: string | undefined = '';
export let onclose: () => void = () => {};
export let onbreadcrumbClick: () => void = () => {};
</script>

<Page
  title={title}
  titleDetail={titleDetail}
  subtitle={subtitle}
  breadcrumbLeftPart={breadcrumbLeftPart}
  breadcrumbRightPart={breadcrumbRightPart}
  breadcrumbTitle={breadcrumbTitle}
  onclose={onclose}
  onbreadcrumbClick={onbreadcrumbClick}>
  <div slot="content" class="h-full bg-[var(--pd-details-bg)] min-h-0">
    <slot name="content" />
  </div>
  <div slot="tabs" class="flex flex-row px-2 border-b border-[var(--pd-content-divider)]">
    <slot name="tabs" />
  </div>
  <svelte:fragment slot="icon">
    <slot name="icon" />
  </svelte:fragment>
  <svelte:fragment slot="subtitle">
    <slot name="subtitle" />
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <slot name="actions" />
  </svelte:fragment>
  <svelte:fragment slot="detail">
    <slot name="detail" />
  </svelte:fragment>
</Page>
