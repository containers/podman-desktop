<script lang="ts">
export let style: string = '';
export let onClick: () => void = () => {};
</script>

<td class="pt-1 pl-3 {style} {$$props.class}" on:click={onClick}>
  <slot />
</td>
