<script lang="ts">
import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import { Dropdown } from '@podman-desktop/ui-svelte';

interface Props {
  connections: ProviderContainerConnectionInfo[];
  value: ProviderContainerConnectionInfo | undefined;
  name?: string;
  id?: string;
  onchange?(value: ProviderContainerConnectionInfo | undefined): void;
  class?: string;
  disabled?: boolean;
}

let {
  connections,
  name = 'providerChoice',
  id,
  value = $bindable(),
  onchange,
  class: className,
  disabled,
}: Props = $props();

/**
 * Map of unique keys to connection objects.
 * Key format: `${type}:${name}` ensures unique identification.
 */
let items = $derived(new Map(connections.map(c => [`${c.type}:${c.name}`, c])));

/**
 * Derive the dropdown's selected key from the value prop.
 * This ensures the dropdown displays the correct selection when value changes externally.
 */
let selected = $derived(value ? `${value.type}:${value.name}` : undefined);

function handleChange(nValue: unknown): void {
  if (typeof nValue === 'string') {
    value = items.get(nValue);
  } else {
    value = undefined;
  }

  onchange?.(value);
}
</script>

<Dropdown
  id={id}
  class={className}
  name={name}
  disabled={disabled}
  value={selected}
  onChange={handleChange}
  options={Array.from(items.entries()).map(([key, connection]) => ({
            label: connection.name,
            value: key,
          }))}>
</Dropdown>
