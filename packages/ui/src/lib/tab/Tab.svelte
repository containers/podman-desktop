<script lang="ts">
export let routerPath: string;
export let url: string;
export let title: string;

let baseURL = routerPath.substring(0, routerPath.lastIndexOf('/'));
</script>

<div
  class="pb-1 border-b-[3px] whitespace-nowrap hover:cursor-pointer"
  class:border-[var(--pd-tab-highlight)]="{routerPath === baseURL + '/' + url}"
  class:border-transparent="{routerPath !== baseURL + '/' + url}"
  class:hover:border-[var(--pd-tab-hover)]="{routerPath !== baseURL + '/' + url}">
  <a
    href="{baseURL}/{url}"
    class="px-4 py-2 text-[var(--pd-tab-text)] no-underline"
    class:text-[var(--pd-tab-text-highlight)]="{routerPath === baseURL + '/' + url}"
    aria-controls="open-tabs-list-{url}-panel"
    id="open-tabs-list-{url}-link">
    {title}
  </a>
</div>
