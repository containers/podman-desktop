<script lang="ts">
import { createRouteObject } from 'tinro/dist/tinro_lib';
import type { TinroBreadcrumb, TinroRouteMeta } from 'tinro';
import { TelemetryService } from './TelemetryService';
import { lastPage, currentPage, listPage, detailsPage } from './stores/breadcrumb';
import type { NavigationHint } from './Route';
import { onDestroy } from 'svelte';

export let path = '/*';
export let fallback = false;
export let redirect = false;
export let firstmatch = false;
export let breadcrumb: string | undefined = undefined;
export let navigationHint: NavigationHint | undefined = undefined;

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
    const curPage = breadcrumbs[breadcrumbs.length - 1];
    if (!curPage) return;

    if (navigationHint === 'root') {
      listPage.set(curPage);
      detailsPage.set({ name: 'Home', path: '/' });
    } else if (navigationHint === 'details') {
      detailsPage.set(curPage);
      lastPage.set($listPage);
    } else if (navigationHint === 'tab') {
      // if we're on a details tab, fix the breadcrumb to come back to this tab
      const path = curPage.path.substring(0, curPage.path.lastIndexOf('/'));
      if ($detailsPage?.path.startsWith(path)) {
        $detailsPage.path = curPage.path;
      } else {
        // otherwise, set the last page normally
        lastPage.set($detailsPage ? $detailsPage : $listPage);
      }
    } else {
      // set the last page to either details or list page
      lastPage.set($detailsPage ? $detailsPage : $listPage);
    }

    // set the current page to this route, unless we're on a tab
    if (navigationHint !== 'tab') {
      currentPage.set(curPage);
    }

    TelemetryService.getService().handlePageOpen(breadcrumbs.map(breadcrumb => breadcrumb.name).join('/'));
  }
}

$: route.update({
  path,
  redirect,
  firstmatch,
  breadcrumb,
});

onDestroy(() => {
  TelemetryService.getService().handlePageClose();
});
</script>

{#if showContent}
  <slot params="{params}" meta="{meta}" />
{/if}
