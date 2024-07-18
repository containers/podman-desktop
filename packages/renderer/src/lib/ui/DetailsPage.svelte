<script lang="ts">
import { DetailsPage } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import { currentPage, lastPage } from '../../stores/breadcrumb';

export let title: string;
export let titleDetail: string | undefined = undefined;
export let subtitle: string | undefined = undefined;

export function close(): void {
  router.goto($lastPage.path);
}
</script>

<DetailsPage
  title={title}
  titleDetail={titleDetail}
  subtitle={subtitle}
  breadcrumbLeftPart={$lastPage.name}
  breadcrumbRightPart={$currentPage.name}
  breadcrumbTitle="Go back to {$lastPage.name}"
  on:close={close}
  on:breadcrumbClick={close}>
  <slot slot="icon" name="icon" />
  <slot slot="subtitle" name="subtitle" />
  <slot slot="actions" name="actions" />
  <slot slot="detail" name="detail" />
  <slot slot="tabs" name="tabs" />
  <slot slot="content" name="content" />
</DetailsPage>
