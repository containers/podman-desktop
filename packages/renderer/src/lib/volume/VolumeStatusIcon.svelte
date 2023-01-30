<script lang="ts">
export let inUse = false;
</script>

{#if inUse}
  <div
    class="bg-green-600 flex flex-col justify-center align-middle m-3 p-1 w-10 text-center items-center rounded"
    title="In Use">
    <svg width="35.992" height="21" version="1.1" viewBox="0 0 9.5229 5.5562" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-5.2499 -8.9203)">
        <g transform="translate(-.18879 1.9844)">
          <path
            d="m5.571 8.1928c0 0.62112 2.0726 1.1246 4.6292 1.1246 2.5566 0 4.6292-0.50352 4.6292-1.1246v3.0424c0 0.62112-2.0725 1.1246-4.6292 1.1246-2.5566 0-4.6292-0.50352-4.6292-1.1246z"
            style="fill:currentColor"></path>
          <path
            d="m5.571 8.1928c0-0.62112 2.0726-1.1246 4.6292-1.1246 2.5566 0 4.6292 0.50352 4.6292 1.1246 0 0.62112-2.0725 1.1246-4.6292 1.1246-2.5566 0-4.6292-0.50352-4.6292-1.1246z"
            style="fill:currentColor"></path>
          <path
            d="m14.829 8.1928c0 0.62112-2.0725 1.1246-4.6292 1.1246-2.5566 0-4.6292-0.50352-4.6292-1.1246 0-0.62112 2.0726-1.1246 4.6292-1.1246 2.5566 0 4.6292 0.50352 4.6292 1.1246v3.0424c0 0.62112-2.0725 1.1246-4.6292 1.1246-2.5566 0-4.6292-0.50352-4.6292-1.1246v-3.0424"
            style="fill:none;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:.26458;stroke:#ddd"></path>
        </g>
      </g>
    </svg>
  </div>
{:else}
  <div
    class="border-gray-400 border-2 flex flex-col justify-center align-middle m-3 p-1 w-10 text-center items-center rounded"
    title="Not Used">
    <svg width="35.992" height="21" version="1.1" viewBox="0 0 9.5229 5.5562" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-5.2499 -8.9203)">
        <g transform="translate(-.18879 1.9844)">
          <path
            d="m5.571 8.1928c0 0.62112 2.0726 1.1246 4.6292 1.1246 2.5566 0 4.6292-0.50352 4.6292-1.1246v3.0424c0 0.62112-2.0725 1.1246-4.6292 1.1246-2.5566 0-4.6292-0.50352-4.6292-1.1246z"
            style="fill:currentColor"></path>
          <path
            d="m5.571 8.1928c0-0.62112 2.0726-1.1246 4.6292-1.1246 2.5566 0 4.6292 0.50352 4.6292 1.1246 0 0.62112-2.0725 1.1246-4.6292 1.1246-2.5566 0-4.6292-0.50352-4.6292-1.1246z"
            style="fill:currentColor"></path>
          <path
            d="m14.829 8.1928c0 0.62112-2.0725 1.1246-4.6292 1.1246-2.5566 0-4.6292-0.50352-4.6292-1.1246 0-0.62112 2.0726-1.1246 4.6292-1.1246 2.5566 0 4.6292 0.50352 4.6292 1.1246v3.0424c0 0.62112-2.0725 1.1246-4.6292 1.1246-2.5566 0-4.6292-0.50352-4.6292-1.1246v-3.0424"
            style="fill:none;stroke-linejoin:round;stroke-miterlimit:10;stroke-width:.26458;stroke:#333"></path>
        </g>
      </g>
    </svg>
  </div>
{/if}
