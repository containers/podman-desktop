<script lang="ts">
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';

import { clearNotifications } from '/@/stores/tasks';
</script>

<Button icon={faTrashCan} on:click={clearNotifications}>Clear all</Button>
