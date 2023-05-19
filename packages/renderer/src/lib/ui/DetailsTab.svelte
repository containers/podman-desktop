<script lang="ts">
import { router } from 'tinro';

export let url;
export let title;

let baseURL = $router.path.substring(0, $router.path.lastIndexOf('/'));
</script>

<li class="pf-c-tabs__item" class:pf-m-current="{$router.path === baseURL + '/' + url}">
  <a
    href="{baseURL}/{url}"
    class="pf-c-tabs__link"
    aria-controls="open-tabs-example-tabs-list-{url}-panel"
    id="open-tabs-example-tabs-list-{url}-link">
    <span class="pf-c-tabs__item-text">{title}</span>
  </a>
</li>
