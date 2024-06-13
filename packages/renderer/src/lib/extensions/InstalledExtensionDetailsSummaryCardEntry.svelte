<script lang="ts">
export let label: string;
export let value: string;
</script>

<div class="flex flex-col lg:mb-4 items-start">
  <div class="uppercase text-xs text-[var(--pd-details-card-header)]">{label}</div>
  <div class="text-left font-thin text-xs text-[var(--pd-details-card-text)]">{value}</div>
</div>
