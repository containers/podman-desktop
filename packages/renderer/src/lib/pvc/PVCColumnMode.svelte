<script lang="ts">
import { faCircle, faEye, faLock, faSitemap, faTh } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import Label from '../ui/Label.svelte';
import type { PVCUI } from './PVCUI';

export let object: PVCUI;

// Determine the icon and color based on the access mode, with comments explaining each icon choice
// Many = multiple access points, so should be green
// Once = exclusive write access, so should be yellow (like a traffic light) similar to the lock icons used which are also yellow
function getModeAttributes(mode: string) {
  switch (mode) {
    case 'ReadOnlyMany':
      // faEye: Symbolizes visibility, suitable for ReadOnlyMany where the volume can be read by many
      return { color: 'text-[var(--pd-status-running)]', icon: faEye };
    case 'ReadWriteMany':
      // faTh: Indicates multiple access points, apt for ReadWriteMany where multiple users can read and write
      return { color: 'text-[var(--pd-status-running)]', icon: faTh };
    case 'ReadWriteOnce':
      // faLock: Represents exclusive write access (one writer), indicative of the ReadWriteOnce mode
      return { color: 'text-[var(--pd-status-paused)]', icon: faLock };
    case 'ReadWriteOncePod':
      // faSitemap: Represents a specific structure or cluster, used for ReadWriteOncePod where access is restricted to a single pod
      return { color: 'text-[var(--pd-status-paused)]', icon: faSitemap };
    default:
      // A generic circle icon for undefined modes
      return { color: 'text-[var(--pd-status-unknown)]', icon: faCircle };
  }
}
</script>

<div class="flex flex-row gap-1">
  {#each object.accessModes as mode}
    <Label name={mode}>
      <Fa size="1x" icon={getModeAttributes(mode).icon} class={getModeAttributes(mode).color} />
    </Label>
  {/each}
</div>
