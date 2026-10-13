<script lang="ts">
import { Checkbox } from '@podman-desktop/ui-svelte';

interface Props {
  checked: boolean;
  label: string;
  onToggle: () => void;
}

let { checked, label, onToggle }: Props = $props();
</script>

<div class="shrink-0 px-2">
  <Checkbox {checked} title={label} class="cursor-pointer text-sm font-normal" onclick={onToggle}>
    <span class="cursor-pointer select-none">{label}</span>
  </Checkbox>
</div>
