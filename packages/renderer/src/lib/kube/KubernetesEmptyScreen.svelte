<script lang='ts'>
import { EmptyScreen } from '@podman-desktop/ui-svelte';
import type { ComponentProps } from 'svelte';

import KubernetesCheckConnection from '/@/lib/ui/KubernetesCheckConnection.svelte';

let { icon, ...restProps }: ComponentProps<EmptyScreen> = $props();
</script>

<EmptyScreen icon={icon} {...restProps}>
  <KubernetesCheckConnection />
</EmptyScreen>
