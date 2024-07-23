<script lang="ts">
import { FormPage } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import { currentPage, lastPage } from '../../stores/breadcrumb';

export let title: string;
export let inProgress = false;

export function goToPreviousPage(): void {
  router.goto($lastPage.path);
}
</script>

<FormPage
  title={title}
  inProgress={inProgress}
  breadcrumbLeftPart={$lastPage.name}
  breadcrumbRightPart={$currentPage.name}
  breadcrumbTitle="Go back to {$lastPage.name}"
  onclose={goToPreviousPage}
  onbreadcrumbClick={goToPreviousPage}>
  <slot slot="icon" name="icon" />
  <slot slot="actions" name="actions" />
  <slot slot="content" name="content" />
</FormPage>
