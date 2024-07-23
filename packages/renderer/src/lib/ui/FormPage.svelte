<script lang="ts">
import { FormPage } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import { currentPage, lastPage } from '../../stores/breadcrumb';

export let title: string;
export let showBreadcrumb = true;
export let inProgress = false;

export function goToPreviousPage(): void {
  router.goto($lastPage.path);
}
</script>

<FormPage
  title={title}
  showBreadcrumb={showBreadcrumb}
  inProgress={inProgress}
  breadcrumbLeftPart={$lastPage.name}
  breadcrumbRightPart={$currentPage.name}
  breadcrumbTitle="Go back to {$lastPage.name}"
  on:close={goToPreviousPage}
  on:breadcrumbClick={goToPreviousPage}>
  <slot slot="icon" name="icon" />
  <slot slot="actions" name="actions" />
  <slot slot="tabs" name="tabs" />
  <slot slot="content" name="content" />
</FormPage>
