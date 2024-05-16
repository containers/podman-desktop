<script lang="ts">
import { router } from 'tinro';

export let url: string;
export let title: string;

let baseURL = $router.path.substring(0, $router.path.lastIndexOf('/'));
</script>

<div
  class="pb-1 border-b-[3px] border-charcoal-700 whitespace-nowrap hover:cursor-pointer"
  class:border-purple-500="{$router.path === baseURL + '/' + url}"
  class:hover:border-charcoal-100="{$router.path !== baseURL + '/' + url}">
  <a
    href="{baseURL}/{url}"
    class="px-4 py-2 text-gray-600 no-underline"
    class:text-white="{$router.path === baseURL + '/' + url}"
    aria-controls="open-tabs-list-{url}-panel"
    id="open-tabs-list-{url}-link">
    {title}
  </a>
</div>
