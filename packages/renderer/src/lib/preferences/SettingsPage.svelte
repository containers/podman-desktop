<script lang="ts">
export let title: string;
</script>

<div class="flex flex-col min-w-full h-full">
  <div class="min-w-full px-5 py-4">
    <div class="flex flex-row">
      <div class="grow">
        <p class="capitalize text-xl">{title}</p>
        <p class="text-sm text-gray-700"><slot name="subtitle"><br /></slot></p>
      </div>
      <slot name="actions" />
    </div>

    <slot name="header" />
  </div>
  <div class="flex flex-row min-w-full h-full px-5 py-4 overflow-y-auto">
    <div class="flex flex-col grow max-w-[905px] mx-auto">
      <slot />
    </div>
  </div>
</div>
