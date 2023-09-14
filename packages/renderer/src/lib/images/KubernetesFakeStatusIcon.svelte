<script lang="ts">
// Status, use one of: Pending, Running, Succeeded, Failed, Unknown
// any other status will result in a standard outlined box
export let status = 'Running';
export let icon: any;

$: solid = true;
</script>

<div class="grid place-content-center" style="position:relative">
  <div
    class="grid place-content-center w-7 h-7 rounded"
    class:bg-green-400="{status === 'Running' || status === 'Succeeded'}"
    class:bg-green-600="{status === 'Pending'}"
    class:bg-amber-600="{status === 'Failed' || status === 'Unknown'}"
    class:border-2="{!solid}"
    class:border-gray-700="{!solid}"
    class:text-gray-700="{!solid}"
    title="{status}">
    <svelte:component this="{icon}" size="20" solid="{solid}" />
  </div>
</div>
