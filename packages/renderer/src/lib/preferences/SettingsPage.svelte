<script lang="ts">
export let title: string;
</script>

<div class="flex flex-col min-h-full min-w-full">
  <div class="min-w-full pt-4 pb-4">
    <div>
      <p class="capitalize text-xl">{title}</p>
      <p class="text-sm text-gray-700"><slot name="subtitle"><br /></slot></p>
    </div>
  </div>
  <slot />
</div>
