<script lang="ts">
export let title: string;
</script>

<div class="flex flex-1 flex-col p-2 bg-zinc-900">
  <div>
    <p class="capitalize text-xl">{title}</p>
    <p class="text-sm text-gray-400"><slot name="subtitle"><br /></slot></p>
  </div>
  <slot />
</div>
