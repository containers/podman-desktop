<script lang="ts">
export let title: string;
</script>

<div class="flex flex-col min-w-full h-full">
  <div class="min-w-full px-5 py-4">
    <div>
      <p class="capitalize text-xl">{title}</p>
      <p class="text-sm text-gray-700"><slot name="subtitle"><br /></slot></p>
    </div>

    <slot name="header" />
  </div>
  <div class="flex flex-col min-w-full h-full px-5 py-4 overflow-y-auto">
    <slot />
  </div>
</div>
