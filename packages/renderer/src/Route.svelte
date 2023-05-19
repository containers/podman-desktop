<script lang="ts">
import { createRouteObject } from 'tinro/dist/tinro_lib';
import type { TinroBreadcrumb, TinroRouteMeta } from 'tinro';
import { TelemetryService } from './TelemetryService';

export let path = '/*';
export let fallback = false;
export let redirect = false;
export let firstmatch = false;
export let breadcrumb = null;

let showContent = false;
let params: Record<string, string> = {};
let meta: TinroRouteMeta = {} as TinroRouteMeta;

const route = createRouteObject({
  fallback,
  onShow() {
    showContent = true;
  },
  onHide() {
    showContent = false;
  },
  onMeta(newMeta: TinroRouteMeta) {
    processMetaBreadcrumbs(newMeta.breadcrumbs);
    meta = newMeta;
    params = meta.params;
  },
});

function processMetaBreadcrumbs(breadcrumbs?: Array<TinroBreadcrumb>) {
  if (breadcrumbs) {
    TelemetryService.getService().handlePageOpen(breadcrumbs.map(breadcrumb => breadcrumb.name).join('/'));
  }
}

$: route.update({
  path,
  redirect,
  firstmatch,
  breadcrumb,
});
</script>

{#if showContent}
  <slot params="{params}" meta="{meta}" />
{/if}
