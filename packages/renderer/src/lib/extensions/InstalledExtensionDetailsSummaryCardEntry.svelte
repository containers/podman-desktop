<script lang="ts">
export let label: string;
export let value: string;
</script>

<div class="flex flex-col lg:mb-4 items-start">
  <div class="uppercase text-xs text-gray-700">{label}</div>
  <div class="text-left font-thin text-xs">{value}</div>
</div>
