<script lang="ts">
import Select from 'svelte-select';

import { colorsInfos } from '/@/stores/colors';
import type { ColorInfo } from '/@api/color-info';

export let onChange = (_e: CustomEvent) => {};
export let onClear = (_e: CustomEvent) => {};

$: colors = getColorsMap($colorsInfos);

function getColorsMap(colors: ColorInfo[]): Map<string, ColorInfo> {
  return colors.reduce((acc, current) => {
    acc.set(current.id, current);
    return acc;
  }, new Map<string, ColorInfo>());
}
</script>

<Select
  {...$$props}
  --background="{colors.get('input-field-bg')?.value}"
  --height="36px"
  --margin="0"
  --padding="8px"
  --font-size="12px"
  --border="transparent"
  --border-focused="transparent"
  --border-hover="transparent"
  --border-radius="0"
  --border-radius-focused="0"
  --disabled-background="{colors.get('input-field-disabled-bg')?.value}"
  --disabled-color="{colors.get('input-field-disabled-text')?.value}"
  --input-margin="0"
  --input-padding="0"
  --item-hover-bg="{colors.get('dropdown-item-hover-bg')?.value}"
  --list-background="{colors.get('dropdown-bg')?.value}"
  --placeholder-color="{colors.get('input-field-placeholder-text')?.value}"
  on:change="{onChange}"
  on:clear="{onClear}"></Select>
