<script lang="ts">
import { faBell } from '@fortawesome/free-solid-svg-icons';

import DropdownMenu from './DropdownMenu.svelte';
import DropDownMenuItem from './DropDownMenuItem.svelte';

interface Props {
  onClick: () => void;
}

let { onClick }: Props = $props();
</script>

<DropdownMenu>
  <DropDownMenuItem title="Item 1" icon={faBell} {onClick} />
</DropdownMenu>
