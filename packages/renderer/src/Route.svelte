<script lang="ts">
import { onDestroy } from 'svelte';
import type { TinroBreadcrumb, TinroRouteMeta } from 'tinro';
import { createRouteObject } from 'tinro/dist/tinro_lib';

import type { NavigationHint } from './navigation';
import { currentPage, history, lastPage } from './stores/breadcrumb';
import { TelemetryService } from './TelemetryService';

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
      history.set([curPage]);
    } else if (navigationHint === 'details') {
      history.set([$history[0], curPage]);
      lastPage.set($history[0]);
    } else if (navigationHint === 'tab') {
      // if we're on a details tab, fix the breadcrumb to come back to this tab
      const path = curPage.path.substring(0, curPage.path.lastIndexOf('/'));
      const last = $history[$history.length - 1];
      if (last?.path.startsWith(path)) {
        last.path = curPage.path;
      } else {
        // otherwise, set the last page normally
        lastPage.set(last);
      }
    } else {
      // set the last page from the history
      lastPage.set($history[$history.length - 1]);
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
  <slot params={params} meta={meta} />
{/if}
