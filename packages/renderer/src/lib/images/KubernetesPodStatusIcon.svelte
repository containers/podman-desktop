<script lang="ts">
// Status, use one of: Pending, Running, Succeeded, Failed, Unknown
// any other status will result in a standard outlined box
export let status = '';
export let terminating = false;
export let icon: any;

$: solid =
  status === 'Pending' ||
  status === 'Running' ||
  status === 'Succeeded' ||
  status === 'Failed' ||
  status === 'Unknown' ||
  terminating;
</script>

<div class="grid place-content-center" style="position:relative">
  <div
    class="grid place-content-center w-7 h-7 rounded"
    class:bg-green-400="{status === 'Running' || status === 'Succeeded'}"
    class:bg-amber-500="{status === 'Pending'}"
    class:bg-red-600="{status === 'Failed' || status === 'Unknown' || terminating}"
    class:border-2="{!solid}"
    class:border-gray-700="{!solid}"
    class:text-gray-700="{!solid}"
    title="{status}">
    <svelte:component this="{icon}" size="20" solid="{solid}" />
  </div>
</div>
