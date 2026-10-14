<script lang="ts">
import { NavigationPage } from '@desktop-framework/api';

import { handleNavigation } from '/@/navigation';

import type { ContainerInfoUI } from './ContainerInfoUI';

interface Props {
  object: ContainerInfoUI;
}

let { object }: Props = $props();

function openContainerDetails(container: ContainerInfoUI): void {
  handleNavigation({
    page: NavigationPage.CONTAINER,
    parameters: {
      id: container.id,
    },
  });
}
</script>

<button class="flex flex-col whitespace-nowrap max-w-full" onclick={(): void => openContainerDetails(object)}>
  <div class="flex items-center max-w-full">
    <div class="max-w-full">
      <div class="flex flex-nowrap max-w-full">
        <div
          class="text-[var(--pd-table-body-text-highlight)] overflow-hidden text-ellipsis group-hover:text-[var(--pd-link)]"
          title={object.name}>
          {object.name}
        </div>
      </div>
      <div class="flex flex-nowrap text-xs font-extra-light text-[var(--pd-table-body-text)] items-center max-w-full">
        <div>{object.state}</div>
        <div class="pl-2 max-w-fit overflow-hidden text-ellipsis">{object.displayPort}</div>
      </div>
    </div>
  </div>
</button>
