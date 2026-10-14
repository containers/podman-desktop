<script lang="ts">
import { NavigationPage } from '@desktop-framework/api';

import type { SecretInfoUI } from '/@/lib/secrets/SecretInfoUI';
import { handleNavigation } from '/@/navigation';

interface Props {
  object: SecretInfoUI;
}

let { object }: Props = $props();
</script>

<button
  class="hover:cursor-pointer flex text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis"
  onclick={(): void =>
    handleNavigation({
      page: NavigationPage.SECRET,
      parameters: {
        id: object.Id,
        engineId: object.engineId,
      },
    })}>
  {object.Name}
</button>
