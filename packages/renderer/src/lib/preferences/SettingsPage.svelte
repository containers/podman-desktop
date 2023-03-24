<script lang="ts">
export let title: string;
</script>

<div class="flex flex-1 flex-col p-2 bg-zinc-900">
  <div>
    <p class="capitalize text-xl">{title}</p>
    <p class="text-sm text-gray-400"><br /></p>
  </div>
  <slot />
</div>
