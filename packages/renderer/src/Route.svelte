<script lang="ts">
import { createRouteObject } from 'tinro/dist/tinro_lib';
import type { TinroBreadcrumb, TinroRouteMeta } from 'tinro';
import { TelemetryService } from './TelemetryService';
import { lastPage, currentPage, listPage, detailsPage } from './stores/breadcrumb';

export let path = '/*';
export let fallback = false;
export let redirect = false;
export let firstmatch = false;
export let breadcrumb = null;
export let navLevel = undefined;

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
    if (navLevel === 'list') {
      listPage.set(curPage);
      detailsPage.set(undefined);
    } else if (navLevel === 'details') {
      detailsPage.set(curPage);
      lastPage.set($listPage);
    } else if (navLevel === 'tab') {
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
    if (navLevel !== 'tab') {
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
</script>

{#if showContent}
  <slot params="{params}" meta="{meta}" />
{/if}
