<script lang="ts">
import { router } from 'tinro';

export let url: string;
export let title: string;

let baseURL = $router.path.substring(0, $router.path.lastIndexOf('/'));
</script>

<div
  class="pb-1 border-b-[3px] whitespace-nowrap hover:cursor-pointer"
  class:border-[var(--pd-tab-highlight)]="{$router.path === baseURL + '/' + url}"
  class:border-transparent="{$router.path !== baseURL + '/' + url}"
  class:hover:border-[var(--pd-tab-hover)]="{$router.path !== baseURL + '/' + url}">
  <a
    href="{baseURL}/{url}"
    class="px-4 py-2 text-[var(--pd-tab-text)] no-underline"
    class:text-[var(--pd-tab-text-highlight)]="{$router.path === baseURL + '/' + url}"
    aria-controls="open-tabs-list-{url}-panel"
    id="open-tabs-list-{url}-link">
    {title}
  </a>
</div>
