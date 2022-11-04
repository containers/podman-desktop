<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
export let engine = '';
let color = '';

if (engine === 'Podman') {
  color = 'text-purple-400';
} else if (engine === 'Docker') {
  color = 'text-blue-400';
}
</script>

<div class="p-1 mx-2 px-2 ml-0 inline-flex text-sm font-light rounded-md bg-zinc-800 text-slate-300">
  <Fa class="h-3 w-3 text-xl mr-2 {color}" icon="{faCircle}" />
  {engine}
</div>
