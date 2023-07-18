<script lang="ts">
import { router } from 'tinro';

export let url;
export let title;

let baseURL = $router.path.substring(0, $router.path.lastIndexOf('/'));
</script>

<div
  class="px-4 pb-2 border-b-[3px] border-charcoal-700 whitespace-nowrap hover:cursor-pointer hover:border-purple-500"
  class:border-purple-500="{$router.path === baseURL + '/' + url}">
  <a
    href="{baseURL}/{url}"
    class="text-gray-600 no-underline"
    class:text-white="{$router.path === baseURL + '/' + url}"
    aria-controls="open-tabs-list-{url}-panel"
    id="open-tabs-list-{url}-link">
    {title}
  </a>
</div>
